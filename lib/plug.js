'use strict';

var arrayify = require('arrayify'),
    autoPlug = require('auto-plug'),
    glob = require('glob'),
    path = require('path');

function Plug(gulp, options) {
    options = options || {};
    this.gulp = gulp;
    this.setOptions(options);
    this.tasks = {};
    this.plugins = {};
    [['util', 'gulp-util'], ['runSequence', 'run-sequence']]
        .forEach(function(mod) {
            Object.defineProperty(this, mod[0], {
                get: function() {
                    return require(mod[1]);
                }
            });
        }.bind(this));
}

Plug.prototype.setOptions = function(options) {
    this.module = options.module || module.parent.parent;
    this.require = options.require || this.module.require;
    this.cwd = options.cwd || path.dirname(this.module.filename);
    this.tasksDir = options.tasksDir || '.gulpplug';
    this.taskGlob = options.taskGlob || '**/*.js';
    this.requireUtilities = options.hasOwnProperty('requireUtilities') ? options.requireUtilities : true;
};

Plug.prototype.getTasksFromGlob = function() {
    return glob.sync(this.taskGlob, {
        cwd: path.join(this.cwd, this.tasksDir)
    }).reduce(function(tasks, filepath) {
        tasks.push({
            file: filepath,
            name: this.getTasknameFromFilepath(filepath)
        });
        return tasks;
    }.bind(this), []);
};

Plug.prototype.addTasks = function(tasks) {
    tasks = tasks || this.getTasksFromGlob();
    arrayify(tasks).forEach(this.addTask.bind(this));
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
        this.gulp.task(task.name, task.dependencies, task.fn.bind(this));
        this.tasks[task.name] = task;
    }
    return this;
};

Plug.prototype.requireTask = function(task) {
    var taskModule = arrayify(this.require(path.join(this.cwd, this.tasksDir, task.file)));
    task.fn = taskModule.pop();
    task.description = taskModule.shift();
    task.dependencies = taskModule.length > 0 ? arrayify(taskModule[0]) : [];
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
    var util = this.util || require('gulp-util');
    util.log(util.colors.yellow('=================================================='));
    util.log(util.colors.yellow('Available Tasks:'));
    this.getTasks().forEach(function(task) {
        util.log(
            util.colors.cyan(task.name) + util.colors.gray(' ➜ ') +
            (task.description ? util.colors.white(task.description) : util.colors.gray('(no description)'))
        );
    }.bind(this));
    util.log(util.colors.yellow('=================================================='));
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
