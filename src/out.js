require('./initializers/set-config-from-stdin');

const {version} = require('./config').resource;

console.log(JSON.stringify({version}));
