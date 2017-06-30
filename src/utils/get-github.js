const getGithubAccessToken = require('./get-github-access-token');
const memoize = require('./memoize');
const Octokat = require('octokat');

module.exports = memoize(async () =>
  new Octokat({token: await getGithubAccessToken()})
);
