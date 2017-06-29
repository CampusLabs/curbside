const builds = require('./builds');
const config = require('../config');

module.exports = build => {
  builds.push(build);
  if (builds.length > config.maxBuilds) builds.shift();
};
