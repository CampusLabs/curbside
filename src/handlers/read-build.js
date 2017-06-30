const _ = require('underscore');
const {NOT_FOUND} = require('../utils/errors');
const authorize = require('./authorize');
const builds = require('../utils/builds');

module.exports = [
  authorize,
  (req, res, next) => {
    const {id} = req.params;
    const i = _.findIndex(builds, {id});
    if ('andNewer' in req.query) return res.send(builds.slice(Math.max(0, i)));

    const build = builds[i];
    if (build) return res.send(build);

    next(NOT_FOUND);
  }
];
