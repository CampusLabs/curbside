module.exports = () =>
  JSON.stringify(require('fs').readFileSync('/dev/null'));
