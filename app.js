'use strict';

const path = require('path');

module.exports = app => {
  const directory = path.join(app.config.baseDir, 'app/rules');
  app.loader.loadToApp(directory, 'rules', {
    call: false,
  });
};
