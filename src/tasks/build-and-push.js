(async () => {
  try {
    await require('../initializers/set-config-from-file')();

    const getGithub = require('../utils/get-github');

    let {build} = require('../config').resource.version;

    const [repo, sha] = build.split(' ');
    const github = await getGithub();
    const commit = await github.repos(repo).commits(sha).fetch();
    console.log('This is the part where we build', commit);
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
