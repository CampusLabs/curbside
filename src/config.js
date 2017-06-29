const {env} = process;

module.exports = {
  concourse: {
    url: env.CONCOURSE_URL,
    user: env.CONCOURSE_USERNAME,
    password: env.CONCOURSE_PASSWORD,
    vault: {
      path: env.CONCOURSE_VAULT_PATH,
      userKey: env.CONCOURSE_VAULT_USERNAME_KEY,
      passwordKey: env.CONCOURSE_VAULT_PASSWORD_KEY
    }
  },
  github: {
    accessToken: env.GITHUB_ACCESS_TOKEN,
    vault: {
      path: env.GITHUB_VAULT_PATH,
      accessTokenKey: env.GITHUB_VAULT_ACCESS_TOKEN_KEY
    }
  },
  key: env.KEY,
  maxBuilds: parseInt(env.MAX_BUILDS) || 1000,
  vault: {
    auth: {
      data: JSON.parse(env.VAULT_AUTH_DATA || '{}'),
      method: env.VAULT_AUTH_METHOD
    },
    url: env.VAULT_URL
  }
};
