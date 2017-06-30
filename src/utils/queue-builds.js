const builds = require('./builds');
const config = require('../config');
const triggerWebhook = require('./trigger-webhook');

module.exports = async newBuilds => {
  for (let build in newBuilds) {
    builds.push(build);
    if (builds.length > config.maxBuilds) builds.shift();
    if (build.concourse) await triggerWebhook(build.concourse);
  }
};
