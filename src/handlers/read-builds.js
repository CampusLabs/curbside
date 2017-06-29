const _ = require('underscore');
const authorize = require('./authorize');
const builds = require('../utils/builds');

module.exports = [
  authorize,
  (req, res) => {
    const {repoName, repoOwner, sha} = req.params;
    const repo = `${repoOwner}/${repoName}`;
    let filtered =
      repoName ? _.filter(builds, {repo: `${repoOwner}/${repoName}`}) :
      repoOwner ? _.filter(builds, ({repo}) =>
        repo.split('/')[0] === repoOwner
      ) :
      builds;
    const from = sha ? Math.max(0, _.findIndex(builds[repo], {sha})) : 0;
    res.send(filtered.slice(from));
  }
];
