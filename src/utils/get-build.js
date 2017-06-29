const _ = require('underscore');
const getGithub = require('./get-github');

// exports.getFile = ({owner, githubToken: token, ref, repo, file}) =>
//   (new Octokat({token})).repos(owner, repo).contents(file).read({ref})
//     .then(({content}) => Buffer.from(content, 'base64').toString())
//     .catch(er => { if (er.status !== 404) throw er; });

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

  config = JSON.parse(config);

  return {config, repo, ref, sha, tags};
};
