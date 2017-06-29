const {accessToken, vault: {accessTokenKey, path}} = require('../config').github;
const Octokat = require('octokat');
const vault = require('./vault');

const getAccessToken = async () =>
  accessToken || (await vault.get(path))[accessTokenKey];

let promise;
module.exports = () =>
  promise || (promise = (async () =>
    new Octokat({token: await getAccessToken()})
  )());
