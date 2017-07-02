const _ = require('underscore');
const getGithubAccessToken = require('./get-github-access-token');
const memoize = require('./memoize');
const Octokat = require('octokat');

// HACK: Disable `console.warn` until
// https://github.com/philschatz/octokat.js/pull/190 is merged because is screws
// up STDOUT
console.warn = _.noop;

module.exports = memoize(async () =>
  new Octokat({token: await getGithubAccessToken()})
);
