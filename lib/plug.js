'use strict';

var arrayify = require('arrayify'),
    autoPlug = require('auto-plug'),
    glob = require('glob'),
    path = require('path');

var Task = require('./task.js');

function Plug(gulp, options) {
    this.gulp = gulp;
    this.tasks = {};
    this.plugins = {};
    this.setOptions(options);
    [['util', 'gulp-util'], ['runSequence', 'run-sequence']]
        .forEach(function(mod) {
            Object.defineProperty(this, mod[0], {
                get: function() {
                    return require(mod[1]);
                }
            });
        }.bind(this));
}

Plug.prototype.getDefaultOptions = function() {
    var mod = module.parent.parent;
    return {
        module: mod,
        require: mod.require,
        cwd: path.dirname(mod.filename),
        tasksDir: '.gulpplug',
        tasksGlob: '**/*.js',
        getTaskName: getTasknameFromFilepath
    };
};

Plug.prototype.setDefaultOptions = function() {
    this.options = this.getDefaultOptions();
    return this;
};

Plug.prototype.setOptions = function(options) {
    options = typeof options === 'object' ? options : {};
    var defaults = this.getDefaultOptions();
    if (!this.hasOwnProperty('options')) {
        this.options = defaults;
    }
    this.options = Object.keys(defaults).reduce(function(_options, optionName) {
        _options[optionName] = options.hasOwnProperty(optionName) ?
            options[optionName] : this.options[optionName];
        return options;
    }.bind(this), {});
    return this;
};

Plug.prototype.getTasksFromGlob = function() {
    return glob.sync(this.options.tasksGlob, {
        cwd: path.join(this.options.cwd, this.options.tasksDir)
    }).reduce(function(tasks, filepath) {
        tasks.push([this.getTasknameFromFilepath(filepath), filepath]);
        return tasks;
    }.bind(this), []);
};

Plug.prototype.addTasks = function(tasks) {
    tasks = tasks || this.getTasksFromGlob();
    arrayify(tasks).forEach(function(task) {
        this.addTask.apply(this, arrayify(task));
    }.bind(this));
    return this;
};

Plug.prototype.addTask = function(task, taskFile) {
    var taskModule = task.length && taskFile ?
            this.options.require(path.join(this.options.cwd, this.options.tasksDir, taskFile))
            : false;
    task = new Task(task, taskModule);
    if (task.isValid()) {
        this.gulp.task(task.name, task.dependencies, task.fn.bind(this));
        this.tasks[task.name] = task;
    }
    return this;
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
    var line = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    this.util.log(this.util.colors.gray(line));
    this.util.log(this.util.colors.yellow('Available Tasks:'));
    this.getTasks().filter(function(task) {
        return task.description !== false;
    }).forEach(function(task) {
        this.util.log(
            this.util.colors.cyan(task.name) +
            this.util.colors.gray(' ➜ ') +
            (typeof task.description === 'string' && task.description.length > 0 ?
                this.util.colors.white(task.description) : this.util.colors.gray('(no description)')
            )
        );
    }.bind(this));
    this.util.log(this.util.colors.gray(line));
    done();
}

Plug.prototype.getTasknameFromFilepath = function(filepath) {
    return this.options.getTaskName(filepath);
};

function getTasknameFromFilepath(filepath) {
    return filepath
        .replace(/([^a-z0-9_\.\/-]+)|(\.[^\.]+$)/gi, '')
        .replace(new RegExp(path.sep, 'g'), ':');
}

Plug.prototype.loadPlugins = function(autoPlugOptions) {
    autoPlugOptions = autoPlugOptions || {};
    if (!autoPlugOptions.hasOwnProperty('module')) {
        autoPlugOptions.module = this.options.module;
    }
    if (!autoPlugOptions.hasOwnProperty('config')) {
        autoPlugOptions.config = require(path.join(this.options.cwd, 'package.json'));
    }
    autoPlugOptions.prefix = 'gulp';
    this.plugins = autoPlug(autoPlugOptions);
    return this;
};

module.exports = Plug;
