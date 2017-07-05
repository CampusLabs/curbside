(async () => {
  try {
    await require('../initializers/set-config-from-file')();

    const _ = require('underscore');
    const {promisify} = require('util');
    const Docker = require('dockerode');
    const getGithub = require('../utils/get-github');
    const fs = require('fs');
    const path = require('path');
    const tar = require('tar-fs');
    const zlib = require('zlib');

    const docker = new Docker();

    const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

    const getImage = async ({image, ref, repo, sha}) => {
      if (!image) return;

      if (typeof image === 'string') image = {repo: image};

      const {repo: imageRepo} = image;
      if (!imageRepo) return;

      let {buildArgs, context, dockerfile, tagPrefix, tags, tagSuffix} = image;
      tags = _.unique([].concat(
        `${imageRepo}:${tagPrefix || ''}${sha}${tagSuffix || ''}`,
        `${imageRepo}:${tagPrefix || ''}${ref}${tagSuffix || ''}`,
        tags || []
      ));

      const github = await getGithub();
      const commit = await github.repos(repo).commits(sha).fetch();
      const cacheTags = [].concat(
        tags[0],
        _.map(commit.parents, ({sha}) => `${imageRepo}:${sha}`),
        tags.slice(1)
      );

      return _.extend(image, {
        buildArgs: buildArgs || {},
        cacheFrom: await getCacheFrom(cacheTags),
        context: context || '.',
        dockerfile: dockerfile || 'Dockerfile',
        repo: imageRepo,
        tags
      });
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
          ({id, progress, status, stream}) =>
            process.stdout.write(
              id ? _.compact([id, status, progress]).join(' ') + '\n' :
              stream || ''
            )
        )
      );

    const getCacheFrom = async tags => {
      for (let tag of tags) {
        try {
          await pullImage(tag);
          return [tag];
        } catch (er) {}
      }
    };

    const pullImage = async tag => {
      const stream = await call(docker, 'pull', tag, {
        authconfig: getAuthConfig(tag)
      });
      try { await handleStream(stream); } catch (er) {}
    };

    const buildImage = async image => {
      const {buildArgs, cacheFrom, context, dockerfile, tags} = image;
      const tarball = tar
        .pack(path.resolve('./curbside/source', context))
        .pipe(zlib.createGzip());
      const stream = await call(docker, 'buildImage', tarball, {
        buildargs: buildArgs,
        cachefrom: cacheFrom,
        dockerfile,
        registryconfig: registryConfig,
        t: tags[0]
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

    const image = await getImage(_.extend({}, config, {ref, repo, sha}));
    if (!image) {
      return console.log('No `image.repo` specified in `curbside.json`');
    }

    console.log('Building...');
    await buildImage(image);

    console.log('Pushing...');
    await Promise.all(_.map(image.tags, pushImage));
  } catch (er) {
    console.error(er.toString());
    process.exit(1);
  }
})();
