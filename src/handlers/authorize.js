const _ = require('underscore');
const {UNAUTHORIZED} = require('../utils/errors');
const config = require('../config');

module.exports = (req, res, next) => {
  const options = _.extend({}, req.body, req.query);
  const {key} = options;
  next(key === config.key ? null : UNAUTHORIZED);
};
