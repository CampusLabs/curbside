const _ = require('underscore');

module.exports = _.reduce({
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401
}, (errors, status, key) =>
  _.extend(errors, {[key]: _.extend(new Error(), {status})})
, {});
