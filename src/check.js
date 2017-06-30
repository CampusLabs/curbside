require('./initializers/set-config-from-stdin');

const _ = require('underscore');
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
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const versions = _.map(data, ({sha}) => ({sha}));
    console.log(JSON.stringify(versions));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
