(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const {
      concourse: {pipeline, resource, team},
      curbside: {url},
      resource: {destination, version, version: {id}},
      webhookToken
    } = require('./config');
    const fetch = require('node-fetch');
    const fs = require('fs');
    const getGithubAccessToken = require('./utils/get-github-access-token');
    const tar = require('tar-fs');
    const zlib = require('zlib');

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

    const res = await fetch(
      `${url}/builds/${team}/${pipeline}/${resource}/${id}` +
      `?webhookToken=${webhookToken}`
    );
    const {repo, sha} = await res.json();
    const accessToken = await getGithubAccessToken();
    const apiUrl = `https://api.github.com/repos/${repo}/tarball/${sha}`;
    await writeSource(await fetch(`${apiUrl}?access_token=${accessToken}`));
    fs.writeFileSync(`${destination}/sha`, sha);
    console.log(JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
