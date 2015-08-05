'use strict';

var path = require('path'),
    plug = require('../../..');

plug.tasksDir = path.join(path.dirname(__filename), '../basic');

plug.addTasks();
