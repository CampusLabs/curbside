(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const {
      concourse: {pipeline, resource, team},
      curbside: {url},
      resource: {version, version: {id}},
      webhookToken
    } = require('./config');
    const getGithub = require('./utils/get-github');

    const res = await fetch(
      `${url}/builds/${team}/${pipeline}/${resource}/${id}` +
      `?webhookToken=${webhookToken}`
    );
    const {repo, sha} = await res.json();
    const github = await getGithub();
    const commit = await github.repos(repo).commits(sha).fetch();
    console.log('Build...', commit);
    console.log(JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
