const config = require('../config');
const fetch = require('node-fetch');

const {concourse: {build, job, pipeline, team}, slack: {url}} = config;
const BUILD_URL = `https://concourse.campuslabs.io/teams/${team}/pipelines` +
  `/${pipeline}/jobs/${job}/builds/${build}`;

const ICONS = {
  building: '🛠',
  error: '🚫',
  success: '✅'
};

module.exports = async (type, message) => {
  if (!url) return;

  const res = await fetch(url, {
    body: JSON.stringify({text: `<${BUILD_URL}|${ICONS[type]}> ${message}`}),
    headers: {'Content-Type': 'application/json'},
    method: 'POST'
  });
  if (res.status >= 400) throw new Error(await res.text());

  return res.json();
};
