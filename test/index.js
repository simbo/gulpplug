'use strict';

var assert = require('assert'),
    intercept = require('intercept-stdout'),
    path = require('path'),
    stripAnsi = require('strip-ansi'),
    util = require('util');

var pkg = require('..'),
    pkgJson = require('../package.json'),
    pkgName = pkgJson.name,
    fixturesDir = path.join(path.dirname(__filename), 'fixtures'),
    expectations = {
        tasks: [
            {
                file: 'bar/baz.js',
                name: 'bar:baz',
                description: 'baz description',
                fn: function() {}
            }, {
                file: 'foo.js',
                name: 'foo',
                fn: function() {}
            }
        ],
        help: [
            '==================================================\n',
            'Available Tasks:\n',
            'bar:baz ➜ baz description\n',
            'foo ➜ (no description)\n',
            'help ➜ display help message\n',
            '==================================================\n'
        ]
    };

describe(pkgName, function() {

    it('should automatically create tasks', function() {
        pkg.tasksDir = path.join(fixturesDir, 'basic');
        pkg.addTasks();
        assert.equal(JSON.stringify(pkg.getTasks()), JSON.stringify(expectations.tasks));
        assert.equal(pkg.gulp.hasTask('bar:baz') && pkg.gulp.hasTask('foo'), true);
    });

    it('should load gulp plugins and accept auto-plug options', function() {
        pkg.parentDir = path.dirname(path.dirname(__filename));
        pkg.loadPlugins({lazy: false});
        assert.deepEqual(pkg.plugins, {util: require('gulp-util')});
    });

    it('should add a help task', function() {
        pkg.addHelpTask();
        assert.equal(pkg.gulp.hasTask('help'), true);
    });

    it('should display a help message', function(done) {
        var log = [],
            lines = 0,
            stopIntercept = intercept(function(msg) {
                if (++lines%2 === 0) {
                    log.push(stripAnsi(msg));
                }
            });
        pkg.gulp.start('help', function() {
            stopIntercept();
            assert.deepEqual(log, expectations.help);
            done();
        });
    });

});
