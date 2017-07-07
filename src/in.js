(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const _ = require('underscore');
    const {promisify} = require('util');
    const config = require('./config');
    const Docker = require('dockerode');
    const fetch = require('node-fetch');
    const fs = require('fs');
    const getGithub = require('./utils/get-github');
    const getGithubAccessToken = require('./utils/get-github-access-token');
    const path = require('path');
    const slack = require('./utils/slack');
    const tar = require('tar-fs');
    const vault = require('./utils/vault');
    const zlib = require('zlib');

    const {docker: {registryConfig}, resource: {destination, version}} = config;

    await slack('building', version.build);

    const stripOne = header => {
      header.name = header.name.split('/').slice(1).join('/');
      return header;
    };

    const writeSource = res =>
      new Promise((resolve, reject) =>
        res.body
          .pipe(zlib.createGunzip())
          .on('error', reject)
          .pipe(tar.extract(`${destination}/source`, {map: stripOne}))
          .on('error', reject)
          .on('finish', resolve)
      );

    const [repo, sha, ...tags] = version.build.split(' ');
    const kv = _.invoke(tags, 'split', '=');
    const ref = (_.find(kv, {0: 'ref'}) || ['ref', sha])[1];
    const i = (_.find(kv, {0: 'config'}) || ['config', 0])[1];
    const accessToken = await getGithubAccessToken();
    const apiUrl = `https://api.github.com/repos/${repo}/tarball/${sha}`;
    await writeSource(await fetch(`${apiUrl}?access_token=${accessToken}`));

    const docker = new Docker();
    const call = (obj, key, ...args) => promisify(obj[key].bind(obj))(...args);

    const getImage = async ({image, ref, repo, sha}) => {
      if (!image) return;

      if (typeof image === 'string') image = {repo: image};

      const {repo: imageRepo} = image;
      if (!imageRepo) return;

      let {context, dockerfile, tagPrefix, tags, tagSuffix} = image;
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
        buildArgs: await getBuildArgs({image, ref, repo, sha}),
        cacheFrom: await getCacheFrom(cacheTags),
        context: context || '.',
        dockerfile: dockerfile || 'Dockerfile',
        repo: imageRepo,
        tags
      });
    };

    const getBuildArgs = async ({
      image: {buildArgs, vaultArgs},
      ref,
      repo,
      sha
    }) => {
      const variables = {REF: ref, REPO: repo, SHA: sha};
      for (let key in vaultArgs || {}) {
        const {path, key: vaultKey} = vaultArgs[key];
        variables[key] = (await vault.get(path))[vaultKey];
      }
      return _.mapObject(buildArgs || {}, str =>
        _.reduce(
          variables,
          (str, val, key) => str.replace(new RegExp(`{{${key}}}`, 'g'), val),
          str
        )
      );
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
          ({stream}) => process.stdout.write(stream || '')
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
      console.log(`Pulling ${tag}...`);
      const stream = await call(docker, 'pull', tag, {
        authconfig: getAuthConfig(tag)
      });
      try { await handleStream(stream); } catch (er) {}
    };

    const buildImage = async image => {
      const {buildArgs, cacheFrom, context, dockerfile, tags} = image;
      console.log(`Building ${tags[0]}...`);
      const tarball = tar
        .pack(path.resolve(`${destination}/source`, context))
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
      console.log(`Pushing ${tag}...`);
      const stream = await call(docker.getImage(tag), 'push', {
        authconfig: getAuthConfig(tag)
      });
      await handleStream(stream);
    };

    let configs = JSON.parse(
      fs.readFileSync(`${destination}/source/curbside.json`)
    );
    if (!_.isArray(configs)) configs = [configs];

    const image = await getImage(_.extend({}, configs[i], {ref, repo, sha}));
    if (!image) {
      return console.log('No `image.repo` specified in `curbside.json`');
    }

    await buildImage(image);

    for (let tag of image.tags) await pushImage(tag);

    await slack('success', image.tags[0]);
    fs.writeSync(3, JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    const slack = require('./utils/slack');
    await slack('error', er.message);
    process.exit(1);
  }
})();
