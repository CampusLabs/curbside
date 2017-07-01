(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const {resource: {version, version: {build}}} = require('./config');
    const getGithub = require('./utils/get-github');

    const [repo, sha] = build.split(' ');
    const github = await getGithub();
    const commit = await github.repos(repo).commits(sha).fetch();
    console.log('Build...', commit);
    console.log(JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
