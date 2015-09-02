'use strict';

var Plug = require('./lib/plug.js');

module.exports = function(gulp) {
    return new Plug(gulp);
};
