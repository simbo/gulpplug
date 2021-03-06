'use strict';

var path = require('path');

var arrayify = require('arrayify'),
    autoPlug = require('auto-plug'),
    glob = require('glob'),
    Options = require('defined-options');

var Task = require('./task.js');

var is = Options.is;

function Plug(gulp, options) {
  this.gulp = gulp;
  this.tasks = {};
  this.plugins = {};
  this.setOptions(options);
  [
    ['util', 'gulp-util'],
    ['runSequence', 'run-sequence']
  ]
    .forEach(function(mod) {
      Object.defineProperty(this, mod[0], {
        get: function() {
          return require(mod[1]);
        }
      });
    }.bind(this));
}

Plug.prototype.setOptions = function(options) {
  if (!this.hasOwnProperty('options')) {
    this.options = new Options({
      module: {
        default: module.parent.parent,
        validate: 'object'
      },
      require: {
        default: function() {
          return this.options.module.require;
        },
        validate: 'function'
      },
      cwd: {
        default: function() {
          return path.dirname(this.options.module.filename);
        },
        validate: 'string!empty'
      },
      tasksDir: {
        default: '.gulpplug',
        validate: 'string!empty'
      },
      tasksGlob: {
        default: '**/*.js',
        validate: 'string!empty'
      },
      getTaskName: {
        default: function() {
          return getTasknameFromFilepath;
        },
        validate: 'function'
      }
    });
  }
  options = typeof options === 'object' ? options : {};
  this.options.merge(options);
  if (this.options.validate('module', options.module)) {
    ['require', 'cwd'].forEach(function(rel) {
      if (!this.options.validate(rel, options[rel])) {
        this.options.default(rel);
      }
    }.bind(this));
  }
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
    this.options.require(path.join(this.options.cwd, this.options.tasksDir, taskFile)) : false;
  task = new Task(task, taskModule);
  if (task.isValid()) {
    this.gulp.task(task.name, task.dependencies, task.fn.bind(this));
    this.tasks[task.name] = task;
  }
  return this;
};

Plug.prototype.addSequence = function(taskName, sequence, taskDescription) {
  if (!is('string!empty', taskName)) return this;
  sequence = arrayify(sequence).filter(function(seq) {
    return is(['string!empty[]', 'string!empty'], seq);
  });
  taskDescription = is('string!empty', taskDescription) ?
    taskDescription : sequence.reduce(function(descr, seq) {
      return descr.concat([Array.isArray(seq) ?
          this.util.colors.gray('[') +
          seq.map(function(seq_) {
            return this.util.colors.cyan(seq_);
          }.bind(this)).join(this.util.colors.gray(' + ')) +
          this.util.colors.gray(']') :
        this.util.colors.cyan(seq)]);
    }.bind(this), []).join(this.util.colors.gray(', '));
  this.addTask({
    name: taskName,
    description: taskDescription,
    fn: function(done) {
      this.runSequence.apply(this.gulp, sequence.concat([done]));
    }
  });
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
  }).sort(function(taskA, taskB) {
    if (taskA.name < taskB.name) return -1;
    if (taskA.name > taskB.name) return 1;
    return 0;
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
  autoPlugOptions.prefix = 'gulp';
  this.plugins = autoPlug(autoPlugOptions);
  return this;
};

module.exports = Plug;
