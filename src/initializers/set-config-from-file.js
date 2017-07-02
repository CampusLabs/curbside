const _ = require('underscore');
const config = require('../config');
const fs = require('fs');

module.exports = () =>
  _.extend(config, JSON.parse(fs.readFileSync('./curbside/config')));
