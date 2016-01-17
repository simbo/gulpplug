'use strict';

var is = require('defined-options').is;

var taskProperties = ['name', 'description', 'dependencies', 'fn'];

function Task(task, taskModule) {
  task = is('object!empty', task) ? task : {name: task};
  mergeProperties.call(this, task);
  if (taskModule) {
    parseModule.call(this, taskModule);
  }
  normalizeProperties.call(this);
}

Task.prototype.isValid = function() {
  return is('string!empty', this.name) &&
    is('array', this.dependencies) &&
    typeof this.fn === 'function';
};

function mergeProperties(task) {
  taskProperties.forEach(function(property) {
    this[property] = task[property];
  }.bind(this));
}

function normalizeProperties() {
  if (!is('string!empty', this.description) && this.description !== false) {
    this.description = null;
  }
  if (is('string!empty', this.dependencies)) {
    this.dependencies = [this.dependencies];
  } else if (!is('array', this.dependencies)) {
    this.dependencies = [];
  }
  if (!is('function', this.fn)) {
    this.fn = function() { };
  }
}

function parseModule(taskModule) {
  if (typeof taskModule === 'function') {
    this.fn = taskModule;
  } else if (is('array', taskModule)) {
    var last = taskModule.pop();
    this.description = taskModule.shift();
    if (is('function', last)) {
      this.fn = last;
      this.dependencies = taskModule.shift();
    } else {
      this.dependencies = last;
    }
  } else if (is('object', taskModule)) {
    mergeProperties.call(this, taskModule);
  }
}

module.exports = Task;
