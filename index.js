'use strict';

var Plug = require('./lib/plug.js');

module.exports = function(gulp, tasksDir, cwd) {
    return new Plug(gulp, tasksDir, cwd);
};

module.exports.Plug = Plug;
