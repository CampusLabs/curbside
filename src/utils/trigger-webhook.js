const _ = require('underscore');
const {concourse, webhookToken} = require('../config');
const fetch = require('node-fetch');

module.exports = async ({team, pipeline, resource}) => {
  const url =
    `${concourse.url}/api/v1/teams/${team}/pipelines/${pipeline}/resources/` +
    `${resource}/check/webhook?webhook_token=${webhookToken}`;
  try {
    const res = await fetch(url, {method: 'POST'});
    if (res.status >= 400) throw new Error(await res.text());
  } catch (er) {
    throw _.extend(
      new Error(`Failed to trigger webhook at ${url}: ${er}`),
      {isPublic: true, status: 400}
    );
  }
};
