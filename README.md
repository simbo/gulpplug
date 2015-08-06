gulpplug
========

  > A small wrapper for 
  > [gulp](https://github.com/gulpjs/gulp), 
  > that requires tasks from files and auto-loads gulp plugins.

<p align="center"><img src="https://raw.github.com/simbo/gulpplug/master/gulpplug.png" alt="gulpplug"></p>

[![npm Package Version](https://img.shields.io/npm/v/gulpplug.svg?style=flat-square)](https://www.npmjs.com/package/gulpplug)
[![MIT License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://simbo.mit-license.org)
[![Dependencies Status](https://img.shields.io/david/simbo/gulpplug.svg?style=flat-square)](https://david-dm.org/simbo/gulpplug)
[![devDependencies Status](https://img.shields.io/david/dev/simbo/gulpplug.svg?style=flat-square)](https://david-dm.org/simbo/gulpplug#info=devDependencies)
[![Travis Build Status](https://img.shields.io/travis/simbo/gulpplug/master.svg?style=flat-square)](https://travis-ci.org/simbo/gulpplug)
[![Code Climate GPA](https://img.shields.io/codeclimate/github/simbo/gulpplug.svg?style=flat-square)](https://codeclimate.com/github/simbo/gulpplug)
[![Code Climate Test Coverage](https://img.shields.io/codeclimate/coverage/github/simbo/gulpplug.svg?style=flat-square)](https://codeclimate.com/github/simbo/gulpplug)

---


## Install

``` bash
npm install --save gulpplug
```

You don't necessarily need `gulp` anymore as a dependency of your project.


## Usage

Your `Gulpfile.js` could look like this:

``` javascript
var plug = require('gulpplug');
plug.loadPlugins().addTasks();
```

*gulpplug* looks for a folder called `.gulpplug/` in the same directory where
your `Gulpfile.js` is.


### Defining Tasks

All files matching `**/*.js` within `.gulpplug/tasks/` will be required and 
should return a function to create a task.

For example, `.gulpplug/tasks/foo.js` will be executable via `gulp foo` and
could look like this:

``` javascript
module.exports = function(taskName, gulp, plug, plugins) {
    gulp.task(taskName, function() {
        return gulp.src(…)
            .pipe(plugins.someGulpPlugin())
            .pipe(gulp.dest(…));
    });
};
```

You can organize your task files in subfolders.  
For example, this will add the tasks `foo` and `bar:baz`:

``` text
my-project/
 ├─╸ .gulpplug/
 │    └─╸ tasks/
 │         ├─╸ bar/
 │         │    └─╸ baz.js
 │         └─╸ foo.js
 └─╸ Gulpfile.js
```


### Help task and descriptions

You can add a automatically generated help task by calling
`plug.addHelpTask()`.

Run the task via `gulp help`. It will show all available tasks with a 
description if available.

Add a task description:

``` javascript
module.exports = [
    'this task does awesome stuff',
    function(taskName, gulp, plug, plugins) {
        …
    }
];
```

### Loading gulp plugins

By calling `plug.loadPlugins()`, [auto-plug](https://github.com/simbo/auto-plug)
will be used to load gulp plugins defined in your projects `package.json`. You
can pass auto-plug options to the method.


## License

[MIT](http://simbo.mit-license.org/)
