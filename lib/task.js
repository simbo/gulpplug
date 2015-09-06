'use strict';

var taskProperties = ['name', 'description', 'dependencies', 'fn'];

function Task(task, taskModule) {
    task = typeof task === 'object' ? task : {name: task};
    mergeProperties.call(this, task);
    if (taskModule) {
        parseModule.call(this, taskModule);
    }
    normalizeProperties.call(this);
}

Task.prototype.isValid = function() {
    return isStringNotEmpty(this.name) &&
        Array.isArray(this.dependencies) &&
        typeof this.fn === 'function' ?
            true : false;
};

function mergeProperties(task) {
    taskProperties.forEach(function(property) {
        this[property] = task[property];
    }.bind(this));
}

function normalizeProperties() {
    if (!isStringNotEmpty(this.description) && this.description !== false) {
        this.description = null;
    }
    if (isStringNotEmpty(this.dependencies)) {
        this.dependencies = [this.dependencies];
    } else if (!Array.isArray(this.dependencies)) {
        this.dependencies = [];
    }
    if (typeof this.fn !== 'function') {
        this.fn = function() { };
    }
}

function parseModule(taskModule) {
    if (typeof taskModule === 'function') {
        this.fn = taskModule;
    } else if (Array.isArray(taskModule)) {
        var last = taskModule.pop();
        this.description = taskModule.shift();
        if (typeof last === 'function') {
            this.fn = last;
            this.dependencies = taskModule.shift();
        } else {
            this.dependencies = last;
        }
    } else if (typeof taskModule === 'object') {
        mergeProperties.call(this, taskModule);
    }
}

function isStringNotEmpty(str) {
    return typeof str === 'string' && str.length > 0 ? true : false;
}

module.exports = Task;
