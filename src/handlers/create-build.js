const _ = require('underscore');
const authorize = require('./authorize');
const getBuilds = require('../utils/get-builds');
const queueBuilds = require('../utils/queue-builds');

const getTags = tags => {
  if (typeof tags === 'string') tags = tags.split(',');
  tags = _.compact(tags);
  if (tags.length) return tags;
};

const getOptions = ({body, headers: {'x-github-event': event}, query}) => {
  if (event) {
    const {
      after: sha,
      deleted,
      ref = '',
      repository: {full_name: repo = ''} = {}
    } = body;
    if (event !== 'push' || deleted) return;

    ref = ref.split('/')[2];
    return repo && ref ? {repo, ref, sha, tags: getTags(query.tags)} : null;
  }

  const {ref, repo, sha, tags} = _.extend({}, body, query);
  return {ref, repo, sha, tags: getTags(tags)};
};

module.exports = [
  authorize,
  async (req, res, next) => {
    try {
      const options = getOptions(req);
      if (!options) return res.send({});

      const builds = await getBuilds(options);
      if (!builds) return res.send({});

      await queueBuilds(builds);
      res.send(builds);
    } catch (er) {
      next(er);
    }
  }
];
