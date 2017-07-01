(async () => {
  try {
    await require('./initializers/set-config-from-env')();
    await require('./initializers/express')();
  } catch (er) {
    console.error(er);
    process.exit(1);
  }
})();
