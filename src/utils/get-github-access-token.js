const {accessToken, vault: {accessTokenKey, path}} = require('../config').github;
const memoize = require('./memoize');
const vault = require('./vault');

module.exports = memoize(async () =>
  accessToken || (await vault.get(path))[accessTokenKey]
);
