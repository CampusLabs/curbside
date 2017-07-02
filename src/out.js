(async () => {
  try {
    await require('./initializers/set-config-from-stdin')();

    const fs = require('fs');
    const getGithub = require('./utils/get-github');

    let {resource: {destination, params: {version}}} = require('./config');

    version = JSON.parse(fs.readFileSync(`${destination}/${version}`));
    const [repo, sha] = version.build.split(' ');
    const github = await getGithub();
    const commit = await github.repos(repo).commits(sha).fetch();
    console.log(JSON.stringify({version}));
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
