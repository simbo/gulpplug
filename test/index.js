'use strict';

var assert = require('assert'),
    childProcess = require('child_process'),
    gulpBin = './../../../node_modules/.bin/gulp',
    path = require('path'),
    pkgJson = require('../package.json'),
    pkgName = pkgJson.name,
    pkg = require('..'),
    fixturesDir = path.join(path.dirname(__filename), 'fixtures'),
    expectations = {
        basic: [{
            file: 'bar/baz.js',
            name: 'bar:baz',
            description: 'baz description',
            fn: function() {}
        }, {
            file: 'foo.js',
            name: 'foo',
            fn: function() {}
        }, {
            name: 'help',
            description: 'display help message',
            fn: function() {}
        }]
    };

describe(pkgName, function() {

    it('should find and add tasks and create a help task', function() {
        pkg.tasksDir = path.join(fixturesDir, 'basic');
        pkg.addTasks();
        assert.deepEqual(JSON.stringify(pkg.getTasks()), JSON.stringify(expectations.basic));
    });

    it('should load gulp plugins and accept auto-plug options', function() {
        pkg.parentDir = path.dirname(path.dirname(__filename));
        pkg.loadPlugins({lazy: false});
        assert.deepEqual(pkg.plugins, {util: require('gulp-util')});
    });

    it('should display a help message', function() {
        var stdout = childProcess.execSync(gulpBin, {
                cwd: path.join(fixturesDir, 'gulp')
            }).toString();
        assert.equal(stdout.search(/(\[\d\d:\d\d:\d\d\][^\n]+\n*){11}/g), 0)
    });

});
