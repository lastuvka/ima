const defaultConfig = require('../../jest.conf.js');

module.exports = {
  ...defaultConfig,
  setupFiles: ['./test.js']
};
