const _ = require('underscore');
const {password, url, username, vault: {passwordKey, path, usernameKey}} = require('../config');
const vault = require('./vault');
const fetch = require('node-fetch');
const memoize = require('./memoize');
const qs = require('querystring');

let token;
const client = async (method, path, {body, headers, query}) => {
  headers = _.extend({}, headers);
  if (token && !headers.Authorization) {
    headers.Cookie = `ATC-Authorization=${token}`;
  }
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(
    `${url}/api/v1${path}${query ? `?${qs.stringify(query)}` : ''}`,
    {body, headers, method}
  );
  return res.json();
};

const getCreds = async () => {
  if (password || username) return {password, username};

  const vaultValue = await vault.get(path);
  return {password: vaultValue[passwordKey], username: vaultValue[usernameKey]};
};

const setToken = async () => {
  const {username, password} = await getCreds();
  const auth = Buffer.from(`${username}:${password}`).toString('base64');
  const {value} = await client('GET', '/teams/my-team/auth/token', {
    headers: {Authorization: `Basic ${auth}`}
  });
  token = value;
};

module.exports = memoize(async () => {
  await setToken();
  return client;
});
