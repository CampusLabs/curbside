const _ = require('underscore');
const fs = require('fs');
const config = require('../utils/set-config');

module.exports = () =>
  _.extend(config, JSON.parse(fs.readFileSync('./curbside/config')));
