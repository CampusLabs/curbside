const {concourse: {url}, webhookToken} = require('../config');
const fetch = require('node-fetch');

module.exports = async ({team, pipeline, resource}) => {
  const res = await fetch(
    `${url}/api/v1/teams/${team}/pipelines/${pipeline}/${resource}` +
    `/check/webhook?webhook_token=${webhookToken}`
  );
  if (res.status >= 400) throw new Error(await res.text());
};
