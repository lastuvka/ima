'use strict';

const processEnvironment = require('./lib/environment.js');
const createLogger = require('./lib/logger.js');
const createUrlParser = require('./lib/urlParser.js');
const createClientApp = require('./lib/clientApp.js');
const createCache = require('./lib/cache.js');

module.exports = environmentConfig => {
  const environment = processEnvironment(environmentConfig);

  global.$Debug = environment.$Debug;
  global.$IMA = global.$IMA || {};

  // require(path.resolve(applicationFolder, './build/ima/shim.es.js'));
  // require(path.resolve(applicationFolder, './build/ima/vendor.server.js'));

  function appFactory() {
    // delete require.cache[
    //   path.resolve(applicationFolder, './build/ima/app.server.js')
    // ];
    //
    // require(path.resolve(applicationFolder, './build/ima/app.server.js'))();
  }

  //TODO add loader param is language
  function languageLoader() {
    return () => {};
  }

  const logger = createLogger(environment);
  const urlParser = createUrlParser(environment);
  const clientApp = createClientApp(
    environment,
    logger,
    languageLoader,
    appFactory
  );
  const cache = createCache(environment);

  return {
    environment,
    clientApp,
    urlParser,
    logger,
    cache
  };
};
