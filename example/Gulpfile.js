'use strict';

var gulp = require('gulp'),
    plug = require('..')(gulp);

plug.loadPlugins()
	.addTasks()
	.addHelpTask();
