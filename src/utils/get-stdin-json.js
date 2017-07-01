module.exports = () =>
  new Promise(resolve => {
    let json = '';
    process.stdin.on('data', data => {
      console.error(json);
      try { resolve(JSON.parse(json += data.toString())); } catch (er) {}
    });
  });
