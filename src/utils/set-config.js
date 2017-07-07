const _ = require('underscore');
const config = require('../config');

const {env} = process;

module.exports = o =>
  _.extend(config, {
    concourse: {
      build: env.BUILD_NAME,
      job: env.BUILD_JOB_NAME,
      pipeline: o.CONCOURSE_PIPELINE,
      resource: o.CONCOURSE_RESOURCE,
      team: o.CONCOURSE_TEAM,
      url: o.CONCOURSE_URL
    },
    curbside: {
      url: o.CURBSIDE_URL
    },
    docker: {
      registryConfig: JSON.parse(o.DOCKER_REGISTRY_CONFIG || '{}'),
      vault: {
        path: o.DOCKER_VAULT_PATH,
        registryConfigKey: o.DOCKER_VAULT_REGISTRY_CONFIG_KEY
      }
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
      params: o.RESOURCE_PARAMS,
      version: {build: o.RESOURCE_VERSION_BUILD}
    },
    slack: {
      url: o.SLACK_URL,
      vault: {
        path: o.SLACK_VAULT_PATH,
        url: o.SLACK_VAULT_URL_KEY
      }
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
