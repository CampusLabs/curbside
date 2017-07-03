(async () => {
  try {
    await require('../initializers/set-config-from-file')();

    const _ = require('underscore');
    const {promisify} = require('util');
    const Docker = require('docker');
    const getGithub = require('../utils/get-github');
    const fs = require('fs');
    const path = require('path');
    const tar = require('tar-fs');
    const zlib = require('zlib');

    const docker = new Docker();

    const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

    const getImage = ({image, sha, ref}) => {
      if (!image) return;

      if (typeof image === 'string') image = {repo: image};

      const {repo} = image;
      if (!repo) return;

      const {buildArgs, context, dockerfile, tagPrefix, tags, tagSuffix} =
        image;
      return _.extend(image, {
        buildArgs: buildArgs || {},
        context: context || '.',
        dockerfile: dockerfile || 'Dockerfile',
        repo,
        tags: _.unique([].concat(
          `${repo}:${tagPrefix || ''}${sha}${tagSuffix || ''}`,
          `${repo}:${tagPrefix || ''}${ref}${tagSuffix || ''}`,
          tags || []
        ))
      });
    };

    const pullImages = async ({image: {repo: imageRepo, tags}, repo}) => {
      try {
        await pullImage(tags[0]);
        return true;
      } catch (er) {
        try {
          const github = await getGithub();
          const commit = await github.repos(repo).commits(sha).fetch();
          await Promise.all(_.map(commit.parents, async ({sha}) => {
            try { await pullImage(`${imageRepo}:${sha}`); } catch (er) {}
          }));
        } catch (er) {}
      }
    };

    const getAuthConfig = tag => {
      let host = tag.split('/').slice(-3, -2)[0];
      if (!host) host = 'https://index.docker.io/v1/';
      return registryConfig[host];
    };

    const handleStream = stream =>
      new Promise((resolve, reject) =>
        docker.modem.followProgress(
          stream,
          er => er ? reject(er) : resolve(),
          ({stream}) => console.log(stream)
        )
      );

    const pullImage = async tag => {
      const stream = await call(docker, 'pull', tag, {
        authconfig: getAuthConfig(tag)
      });
      try { await handleStream(stream); } catch (er) {}
    };

    const buildImage = async image => {
      const {buildArgs, context, dockerfile, tags} = image;
      const tarball = tar
        .pack(path.resolve('./curbside/source', context))
        .pipe(zlib.createGzip());
      const stream = await call(docker, 'buildImage', tarball, {
        registryconfig: registryConfig,
        buildargs: buildArgs,
        t: tags[0],
        dockerfile
      });
      await handleStream(stream);
      return Promise.all(_.map(tags.slice(1), fullTag => {
        const [repo, tag] = fullTag.split(':');
        return call(docker.getImage(tags[0]), 'tag', {repo, tag});
      }));
    };

    const pushImage = async tag => {
      const stream = await call(docker.getImage(tag), 'push', {
        authconfig: getAuthConfig(tag)
      });
      await handleStream(stream);
    };

    const {docker: {registryConfig}, resource: {version: {build}}} =
      require('../config');
    const [repo, sha, ...tags] = build.split(' ');
    const kv = _.invoke(tags, 'split', '=');
    const ref = (_.find(kv, {0: 'ref'}) || ['ref', sha])[1];
    const i = (_.find(kv, {0: 'config'}) || ['config', 0])[1];
    let configs = JSON.parse(
      fs.readFileSync('./curbside/source/curbside.json')
    );
    if (!_.isArray(configs)) configs = [configs];
    const config = configs[i];

    const image = getImage(_.extend({}, config, {sha, ref}));
    if (!image) {
      return console.log('No `image.repo` specified in `curbside.json`');
    }

    await pullImages({image, repo});
    await buildImage(image);
    await Promise.all(_.map(tags, pushImage));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
