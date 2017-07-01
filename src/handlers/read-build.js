const _ = require('underscore');
const {NOT_FOUND} = require('../utils/errors');
const authorize = require('./authorize');
const builds = require('../utils/builds');

module.exports = [
  authorize,
  (req, res, next) => {
    let {pipeline, resource, team, id} = req.params;
    if (!team) return res.send(builds);

    const match = _.pick({pipeline, resource, team}, _.identity);
    const scoped = _.filter(builds, ({concourse}) =>
      _.isMatch(concourse, match)
    );
    if (!id) return res.send(scoped);

    const [repo, sha, ...tags] = Buffer.from(id, 'hex').toString().split(' ');
    const i = _.findIndex(scoped, build =>
      build.repo === repo &&
      build.sha === sha &&
      _.isEqual(build.tags, tags)
    );
    if ('andNewer' in req.query) return res.send(scoped.slice(Math.max(0, i)));

    const build = scoped[i];
    if (build) return res.send(build);

    next(NOT_FOUND);
  }
];
