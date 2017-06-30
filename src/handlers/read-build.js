const _ = require('underscore');
const {NOT_FOUND} = require('../utils/errors');
const authorize = require('./authorize');
const builds = require('../utils/builds');

module.exports = [
  authorize,
  (req, res, next) => {
    const {pipeline, resource, team, id} = req.params;
    if (!team) return builds;

    const match = _.pick({pipeline, resource, team}, _.identity);
    const scoped = _.filter(builds, ({concourse}) =>
      _.isMatch(concourse, match)
    );
    const i = _.findIndex(scoped, {id});
    if (!id || 'andNewer' in req.query) {
      return res.send(scoped.slice(Math.max(0, i)));
    }

    const build = scoped[i];
    if (build) return res.send(build);

    next(NOT_FOUND);
  }
];
