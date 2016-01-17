'use strict';

var Plug = require('./lib/plug.js');

module.exports = function(gulp, options) {
  return new Plug(gulp, options);
};

module.exports.Plug = Plug;
