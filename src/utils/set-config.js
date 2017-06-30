const _ = require('underscore');
const config = require('../config');

module.exports = o =>
  _.extend(config, {
    concourse: {
      url: o.CONCOURSE_URL,
      user: o.CONCOURSE_USERNAME,
      password: o.CONCOURSE_PASSWORD,
      vault: {
        path: o.CONCOURSE_VAULT_PATH,
        userKey: o.CONCOURSE_VAULT_USERNAME_KEY,
        passwordKey: o.CONCOURSE_VAULT_PASSWORD_KEY
      }
    },
    curbside: {
      key: o.CURBSIDE_KEY,
      url: o.CURBSIDE_URL
    },
    github: {
      accessToken: o.GITHUB_ACCESS_TOKEN,
      vault: {
        path: o.GITHUB_VAULT_PATH,
        accessTokenKey: o.GITHUB_VAULT_ACCESS_TOKEN_KEY
      }
    },
    maxBuilds: parseInt(o.MAX_BUILDS) || 1000,
    vault: {
      auth: {
        data: JSON.parse(o.VAULT_AUTH_DATA || '{}'),
        method: o.VAULT_AUTH_METHOD
      },
      url: o.VAULT_URL
    },
    resource: {
      destination: o.RESOURCE_DESTINATION,
      repo: o.RESOURCE_REPO,
      version: {sha: o.RESOURCE_VERSION_SHA}
    }
  });
