const {NOT_FOUND} = require('../utils/errors');
const bodyParser = require('body-parser');
const express = require('express');

express()
  .enable('case sensitive routing')
  .enable('strict routing')
  .disable('x-powered-by')
  .use(bodyParser.json())
  .get('/health-check', require('../handlers/health-check'))
  .get('/builds/:repoOwner/:repoName/:sha', require('../handlers/read-builds'))
  .post('/builds', require('../handlers/create-build'))
  .use((req, res, next) => next(NOT_FOUND))
  .use(require('../handlers/error'))
  .listen(80);
