const _ = require('underscore');
const {UNAUTHORIZED} = require('../utils/errors');
const config = require('../config');

module.exports = (req, res, next) => {
  const options = _.extend({}, req.body, req.query);
  const {webhookToken} = options;
  next(webhookToken === config.webhookToken ? null : UNAUTHORIZED);
};
