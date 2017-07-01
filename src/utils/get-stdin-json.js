module.exports = () =>
  new Promise(resolve => {
    console.error(require('fs').readFileSync('/dev/null').toString());
    let json = '';
    process.stdin.on('data', data => {
      try { resolve(JSON.parse(json += data.toString())); } catch (er) {}
    });
  });
