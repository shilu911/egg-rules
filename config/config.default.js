'use strict';

/**
 * egg-rules default config
 * @member Config#rules
 * @property {String} SOME_KEY - some description
 */
exports.rules = {

};

exports.mongoose = {
  client: {
    url: 'mongodb://127.0.0.1/rules',
    options: {},
  },
};