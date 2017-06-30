const _ = require('underscore');
const getGithub = require('./get-github');
const uuid = require('uuid/v4');

const NO_REPO_REF_ERROR = _.extend(
  new Error('`repo` and `ref` are required'),
  {isPublic: true, status: 400}
);

const flattenBuilds = options => {
  let {config} = options;
  if (!_.isArray(config)) config = [config];
  const shared = _.omit(options, 'config');
  return _.map(config, config =>
    _.extend({}, config, shared, {
      id: uuid(),
      tags:
        config.tags && shared.tags ?
        config.tags.concat(shared.tags) :
        config.tags || shared.tags
    })
  );
};

module.exports = async options => {
  let {repo, ref, sha, tags} = options;
  if (!repo || !ref) throw NO_REPO_REF_ERROR;

  const github = await getGithub();
  if (!sha) sha = (await github.repos(repo).commits(sha || ref).fetch()).sha;

  let config;
  try {
    config = await github.repos(repo).contents('curbside.json').read({
      ref: sha
    });
  } catch (er) {
    if (!er.message.endsWith('Status: 404')) throw er;
  }

  if (!config) return [];

  try {
    config = JSON.parse(config);
  } catch (er) {
    throw _.extend(
      new Error(`Unable to parse curbside.json. ${er}`),
      {isPublic: true, status: 400}
    );
  }

  if (!config.concourse) {
    throw _.extend(
      new Error(
        'A `concourse` object of shape `{team, pipeline, resource}` is ' +
        'required for each curbside.json entry'
      ),
      {isPublic: true, status: 400}
    );
  }

  return flattenBuilds({config, repo, ref, sha, tags});
};
