'use strict';

var gulp = require('gulp');

var plug = require('..')(gulp);

plug.loadPlugins()
  .addTasks()
  .addHelpTask();

plug.addSequence('a-seq', ['hello', ['first', 'move:foo']]);
