const _ = require('underscore');
const authorize = require('./authorize');
const builds = require('../utils/builds');

module.exports = [
  authorize,
  (req, res) => {
    const {repoName, repoOwner, sha} = req.params;
    const repo = `${repoOwner}/${repoName}`;
    const from = Math.max(0, _.findIndex(builds[repo], {sha}));
    res.send(_.filter(builds, {repo}).slice(from));
  }
];
