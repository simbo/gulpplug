'use strict';

var autoPlug = require('auto-plug'),
    glob = require('glob'),
    path = require('path');

function Plug() {
    this.parentDir = path.dirname(module.parent.filename);
    this.dir = path.join(this.parentDir, '.gulpplug');
    this.tasksDir = path.join(this.dir, 'tasks');
    this.taskGlob = '**/*.js';
    this.gulp = require('gulp');
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
        task.fn(task.name, this.gulp, this, this.plugins);
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

function helpTask(taskName, gulp, plug) {
    var gutil = require('gulp-util'),
        chalk = gutil.colors;
    gulp.task(taskName, function(done) {
        gutil.log(chalk.yellow('=================================================='));
        gutil.log(chalk.yellow('Available Tasks:'));
        plug.getTasks().forEach(function(task) {
            gutil.log(
                chalk.cyan(task.name) + chalk.gray(' ➜ ') +
                (task.description ? chalk.white(task.description) : chalk.gray('(no description)'))
            );
        });
        gutil.log(chalk.yellow('=================================================='));
        done();
    });
}

Plug.prototype.getTasknameFromFilepath = function(filepath) {
    return filepath//.toLowerCase()
        .replace(/([^a-z0-9_\.\/-]+)|(\.[^\.]+$)/gi, '')
        .replace(new RegExp(path.sep, 'g'), ':');
};

Plug.prototype.loadPlugins = function(autoPlugOptions) {
    autoPlugOptions = autoPlugOptions || {};
    autoPlugOptions.prefix = 'gulp';
    autoPlugOptions.config = require(path.join(this.parentDir, 'package.json'));
    this.plugins = autoPlug(autoPlugOptions);
    return this;
};

module.exports = new Plug();
