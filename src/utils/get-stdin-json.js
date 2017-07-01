module.exports = () =>
  new Promise(resolve => {
    let json = '';
    process.stdin.on('data', data => {
      console.error(data);
      try { resolve(JSON.parse(json += data.toString())); } catch (er) {}
    });
  });
