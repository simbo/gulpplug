'use strict';

var autoPlug = require('auto-plug'),
    glob = require('glob'),
    gulpUtil = require('gulp-util'),
    path = require('path');

function Plug(gulp, tasksDir, cwd) {
    tasksDir = tasksDir || '.gulpplug';
    cwd = cwd || path.dirname(module.parent.parent.filename);
    this.gulp = gulp;
    this.util = gulpUtil;
    this.cwd = cwd;
    this.tasksDir = path.join(this.cwd, tasksDir);
    this.taskGlob = '**/*.js';
    this.help = true;
    this.autoPlug = true;
    this.tasks = {};
    this.plugins = {};
}

Plug.prototype.addTasks = function() {
    glob.sync(this.taskGlob, {
        cwd: this.tasksDir
    }).forEach(function(filepath) {
        this.addTask({
            file: filepath,
            name: this.getTasknameFromFilepath(filepath)
        });
    }.bind(this));
    return this;
};

Plug.prototype.addTask = function(task) {
    if (task.name === '' || this.tasks.hasOwnProperty(task.name)) {
        return this;
    }
    if (!task.hasOwnProperty('fn')) {
        task = this.requireTask(task);
    }
    if (typeof task.fn === 'function') {
        this.gulp.task(task.name, task.fn.bind(this));
        this.tasks[task.name] = task;
    }
    return this;
};

Plug.prototype.requireTask = function(task) {
    var taskModule = require(path.join(this.tasksDir, task.file));
    if (Array.isArray(taskModule) && taskModule.length === 2) {
        task.description = taskModule[0];
        task.fn = taskModule[1];
    } else {
        task.fn = taskModule;
    }
    return task;
};

Plug.prototype.getTasks = function() {
    return Object.keys(this.tasks).reduce(function(tasks, taskName) {
        tasks.push(this.tasks[taskName]);
        return tasks;
    }.bind(this), []);
};

Plug.prototype.addHelpTask = function() {
    this.addTask({
        name: 'help',
        fn: helpTask,
        description: 'display help message'
    });
    if (!this.gulp.hasTask('default')) {
        this.gulp.task('default', ['help']);
    }
    return this;
};

function helpTask(done) {
    var chalk = this.util.colors;
    this.util.log(chalk.yellow('=================================================='));
    this.util.log(chalk.yellow('Available Tasks:'));
    this.getTasks().forEach(function(task) {
        this.util.log(
            chalk.cyan(task.name) + chalk.gray(' ➜ ') +
            (task.description ? chalk.white(task.description) : chalk.gray('(no description)'))
        );
    }.bind(this));
    this.util.log(chalk.yellow('=================================================='));
    done();
}

Plug.prototype.getTasknameFromFilepath = function(filepath) {
    return filepath
        .replace(/([^a-z0-9_\.\/-]+)|(\.[^\.]+$)/gi, '')
        .replace(new RegExp(path.sep, 'g'), ':');
};

Plug.prototype.loadPlugins = function(autoPlugOptions) {
    autoPlugOptions = autoPlugOptions || {};
    if (!autoPlugOptions.hasOwnProperty('module')) {
        autoPlugOptions.module = module.parent.parent;
    }
    if (!autoPlugOptions.hasOwnProperty('config')) {
        autoPlugOptions.config = require(path.join(this.cwd, 'package.json'));
    }
    autoPlugOptions.prefix = 'gulp';
    this.plugins = autoPlug(autoPlugOptions);
    return this;
};

module.exports = Plug;
