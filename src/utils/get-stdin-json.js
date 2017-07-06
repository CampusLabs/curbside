module.exports = () =>
  new Promise((resolve, reject) => {
    let stdin = '';
    process.stdin
      .on('data', data => {
        try { resolve(JSON.parse(stdin += data.toString())); } catch (er) {}
      })
      .on('end', () => reject(JSON.parse(stdin)));
  });
