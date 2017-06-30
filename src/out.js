require('./initializers/set-config-from-stdin');

const {version, version: {repo, sha}} = require('./config').resource;
const getGithub = require('./utils/get-github');

(async () => {
  try {
    const github = await getGithub();
    const commit = await github.repos(repo).commits(sha).fetch();
    console.log('Build...', commit);
    console.log(JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
