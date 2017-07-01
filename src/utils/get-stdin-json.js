module.exports = () =>
  new Promise(resolve => {
    let json = '';
    process.stdin.on('data', data => {
      console.error(data.toString());
      try { resolve(JSON.parse(json += data.toString())); } catch (er) {}
    });
  });
