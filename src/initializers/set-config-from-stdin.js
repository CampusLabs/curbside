const _ = require('underscore');
const fs = require('fs');
const setConfig = require('../utils/set-config');

const {2: destination} = process.argv;
const {source, version: {id} = {}} = {};//JSON.parse(fs.readFileSync('/dev/stdin'));

const toEnv = (obj, env = {}, parent = []) => {
  if (_.isObject(obj)) {
    _.each(obj, (obj, key) => toEnv(obj, env, parent.concat(key)));
  } else {
    env[parent.join('_').toUpperCase()] = obj;
  }

  return env;
};

setConfig(
  _.extend(toEnv(source), {
    RESOURCE_DESTINATION: destination,
    RESOURCE_VERSION_ID: id
  })
);
