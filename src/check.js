(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const _ = require('underscore');
    const config = require('./config');
    const fetch = require('node-fetch');

    const {
      concourse: {pipeline, resource, team},
      curbside: {url},
      resource: {version: {id}},
      webhookToken
    } = config;

    const res = await fetch(
      `${url}/builds/${team}/${pipeline}/${resource}` +
      (id ? `/${Buffer.from(id).toString('hex')}` : '') +
      `?andNewer&webhookToken=${webhookToken}`
    );
    const builds = await res.json();
    if (builds.error) throw new Error(builds.error);

    console.log(JSON.stringify(_.map(builds, ({repo, ref, sha, tags}) => ({
      id: [repo, ref, sha].concat(tags).join(' ')
    }))));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
