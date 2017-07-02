const builds = require('./builds');
const config = require('../config');
const triggerWebhook = require('./trigger-webhook');

module.exports = async newBuilds => {
  for (let build of newBuilds) {
    builds.push(build);
    if (builds.length > config.maxBuilds) builds.shift();
    // XXX: Uncomment after concourse upgrade
    // await triggerWebhook(build);
  }
};
