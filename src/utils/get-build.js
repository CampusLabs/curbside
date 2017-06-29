const _ = require('underscore');
const getGithub = require('./get-github');

const NO_REPO_REF_ERROR = _.extend(
  new Error('`repo` and `ref` are required'),
  {isPublic: true, status: 400}
);

module.exports = async options => {
  let {repo, ref, sha, tags} = options;
  if (!repo || !ref) throw NO_REPO_REF_ERROR;

  const github = await getGithub();
  if (!sha) sha = (await github.repos(repo).commits(ref).fetch()).sha;

  let config;
  try {
    config = await github.repos(repo).contents('curbside.json').read({
      ref: sha
    });
  } catch (er) {
    if (!er.message.endsWith('Status: 404')) throw er;
  }

  if (!config) return;

  try {
    config = JSON.parse(config);
  } catch (er) {
    throw _.extend(
      new Error(`Unable to parse curbside.json. ${er}`),
      {isPublic: true, status: 400}
    );
  }

  return {config, repo, ref, sha, tags};
};
