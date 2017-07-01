const _ = require('underscore');
const getStdinJson = require('../utils/get-stdin-json');
const setConfig = require('../utils/set-config');

const {2: destination} = process.argv;

const toEnv = (obj, env = {}, parent = []) => {
  if (_.isObject(obj)) {
    _.each(obj, (obj, key) => toEnv(obj, env, parent.concat(key)));
  } else {
    env[parent.join('_').toUpperCase()] = obj;
  }

  return env;
};

module.exports = async () => {
  const {params, source, version} = await getStdinJson();
  setConfig(_.extend(toEnv(source), {
    RESOURCE_DESTINATION: destination,
    RESOURCE_PARAMS: params,
    RESOURCE_VERSION_BUILD: version && version.build
  }));
};
