'use strict';

var gulp = require('gulp');

var plug = require('..')(gulp);

plug.loadPlugins()
  .addTasks()
  .addHelpTask();
