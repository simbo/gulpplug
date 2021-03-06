'use strict';

var assert = require('assert'),
    path = require('path');

var intercept = require('intercept-stdout'),
    stripAnsi = require('strip-ansi'),
    gulp = require('gulp');

var pkg = require('..')(gulp),
    pkgJson = require('../package.json');

var pkgName = pkgJson.name,
    fixturesDir = path.join(path.dirname(__filename), 'fixtures'),
    expectations = {
      tasks: [{
        name: 'bar:baz',
        description: 'baz description',
        dependencies: [],
        fn: function() {}
      }, {
        name: 'foo',
        description: null,
        dependencies: [],
        fn: function() {}
      }],
      help: [
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n',
        'Available Tasks:\n',
        'a-seq ➜ help, [foo + bar:baz]\n',
        'bar:baz ➜ baz description\n',
        'foo ➜ (no description)\n',
        'help ➜ display help message\n',
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
      ],
      exec: 'Starting \'help\'...\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Available Tasks:\n' +
        'a-seq ➜ hello, [first + move:foo]\n' +
        'first ➜ First function\n' +
        'hello ➜ Awesome task\n' +
        'help ➜ display help message\n' +
        'move:foo ➜ moves foo.txt from src/ to dest/\n' +
        '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
        'Finished \'help\'\n' +
        'Starting \'default\'...\n' +
        'Finished \'default\'\n' +
        'Starting \'first\'...\n' +
        'I\'m running first…\n' +
        'Finished \'first\'\n' +
        'Starting \'hello\'...\n' +
        'Hello!\n' +
        'Done.\n' +
        'Finished \'hello\'\n'
    };

describe(pkgName, function() {

  it('should automatically create tasks', function() {
    pkg.setOptions({
      cwd: fixturesDir,
      tasksDir: 'basic'
    });
    pkg.addTasks();
    assert.equal(JSON.stringify(pkg.getTasks()), JSON.stringify(expectations.tasks));
    assert.equal(pkg.gulp.hasTask('bar:baz') && pkg.gulp.hasTask('foo'), true);
  });

  it('should load gulp plugins and accept auto-plug options', function() {
    pkg.setOptions({module: module});
    pkg.loadPlugins({lazy: false});
    assert.deepEqual(pkg.plugins, {util: require('gulp-util')});
  });

  it('should add a help task', function() {
    pkg.addHelpTask();
    assert.equal(pkg.gulp.hasTask('help'), true);
  });

  it('should add a sequence', function() {
    pkg.addSequence('a-seq', ['help', ['foo', 'bar:baz']]);
    assert.equal(pkg.gulp.hasTask('a-seq'), true);
  });

  it('should display a help message', function(done) {
    var log = [],
        lines = 0,
        stopIntercept = intercept(function(msg) {
          if (++lines % 2 === 0) {
            log.push(stripAnsi(msg));
          }
        });
    pkg.gulp.start('help', function() {
      stopIntercept();
      assert.deepEqual(log, expectations.help);
      done();
    });
  });

  it('should work in its normal environment', function(done) {
    var exec = require('child_process').exec;
    var execOptions = {
          cwd: path.join(process.cwd(), 'example')
        },
        regexpLogtime = /\[[0-9]{2}:[0-9]{2}:[0-9]{2}\]\ /ig,
        log = '';
    this.timeout(10000);
    exec('gulp', execOptions, function(error, stdout) {
      if (error) {
        throw error;
      }
      log += stdout.replace(regexpLogtime, '');
      exec('gulp hello', execOptions, function(error, stdout) {
        if (error) {
          throw error;
        }
        log = (log + stdout.replace(regexpLogtime, ''))
          .replace(/Using\ gulpfile[^\n]+\n/ig, '')
          .replace(/(Finished\ [a-z']+)\ after[^\n]+\n/ig, '$1\n');
        assert.equal(log, expectations.exec);
        done();
      });
    });
  });

});
