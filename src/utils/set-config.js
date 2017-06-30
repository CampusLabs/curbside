const _ = require('underscore');
const config = require('../config');

module.exports = o =>
  _.extend(config, {
    concourse: {
      pipeline: o.CONCOURSE_PIPELINE,
      resource: o.CONCOURSE_RESOURCE,
      team: o.CONCOURSE_TEAM,
      url: o.CONCOURSE_URL
    },
    curbside: {
      url: o.CURBSIDE_URL
    },
    docker: {
      registryConfig: JSON.parse(o.DOCKER_REGISTRY_CONFIG || '{}')
    },
    github: {
      accessToken: o.GITHUB_ACCESS_TOKEN,
      vault: {
        path: o.GITHUB_VAULT_PATH,
        accessTokenKey: o.GITHUB_VAULT_ACCESS_TOKEN_KEY
      }
    },
    maxBuilds: parseInt(o.MAX_BUILDS) || 1000,
    resource: {
      destination: o.RESOURCE_DESTINATION,
      repo: o.RESOURCE_REPO,
      version: {id: o.RESOURCE_VERSION_ID}
    },
    vault: {
      auth: {
        data: JSON.parse(o.VAULT_AUTH_DATA || '{}'),
        method: o.VAULT_AUTH_METHOD
      },
      url: o.VAULT_URL
    },
    webhookToken: o.WEBHOOK_TOKEN
  });
