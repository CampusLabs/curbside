require('./initializers/set-config-from-stdin');

const config = require('./config');
const fetch = require('node-fetch');

const {
  curbside: {url},
  resource: {version: {concourse: {pipeline, resource, team}, id}},
  webhookToken
} = config;

(async () => {
  try {
    const res = await fetch(
      `${url}/builds/${team}/${pipeline}/${resource}/${id}` +
      `?webhookToken=${webhookToken}`
    );
    const builds = await res.json();
    if (builds.error) throw new Error(builds.error);

    console.log(JSON.stringify(builds));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
