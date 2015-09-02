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

<!-- MarkdownTOC -->

- [Install](#install)
- [Usage](#usage)
    - [Defining Tasks](#defining-tasks)
    - [Help task and descriptions](#help-task-and-descriptions)
    - [Loading gulp plugins](#loading-gulp-plugins)
    - [Plug Class](#plug-class)
- [License](#license)

<!-- /MarkdownTOC -->


## Install

``` bash
npm install --save gulpplug
```

You still need `gulp` as a dependency of your project.


## Usage

Your `Gulpfile.js` could look like this:

``` javascript
var gulp = require('gulp'),
    plug = require('gulpplug')(gulp);

plug.loadPlugins().addTasks();
```

*gulpplug* looks for a folder called `.gulpplug/` in the same directory where
your `Gulpfile.js` is.

See also `example/`.


### Defining Tasks

All files matching `**/*.js` within `.gulpplug/` will be required and should 
return a function to create a task.

For example, `.gulpplug/foo.js` will be executable via `gulp foo` and could 
look like this:

``` javascript
module.exports = function() {
    return this.gulp.src(…)
        .pipe(this.plugins.someGulpPlugin())
        .pipe(this.gulp.dest(…));
    });
};
```

`this` is your current [`Plug`](#plug-class) instance, delivering `gulp`, 
[`gulp-util`](https://github.com/gulpjs/gulp-util) and 
[`chalk`](https://github.com/chalk/chalk) as properties. 
(As well as other properties and methods you may want to use - take a look at 
the [sourcecode](https://github.com/simbo/gulpplug/blob/master/lib/plug.js).)

``` javascript
module.exports = function(done) {
    this.util.log(chalk.green('Starting async things…'));
    setTimeout(function() {
        this.util.log(chalk.red('Async stuff done.'));
        done();
    }.bind(this)), 100);
};
```

You can organize your task files in subfolders.  
For example, this will add the tasks `foo` and `bar:baz`:

``` text
my-project/
 ├─╸ .gulpplug/
 │    ├─╸ bar/
 │    │    └─╸ baz.js
 │    └─╸ foo.js
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
    function() {
        …
    }
];
```

### Loading gulp plugins

By calling `plug.loadPlugins()`, [auto-plug](https://github.com/simbo/auto-plug)
will be used to load gulp plugins defined in your projects `package.json`. You
can pass auto-plug options to the method.


### Plug Class

By calling `require('gulpplug')(…)` you get a new instance of `Plug`, which 
accepts up to 3 arguments:

  - `gulp` (required)  
    current gulp instance
  - `tasksDir`  
    path to tasks folder, relative to current working directory; defaults to 
    `.gulpplug`
  - `cwd`  
    current working directory (where your `Gulpfile.js` and `package.json` 
    are); defaults *gulpplug*'s parent module directory

You can also access the class directly.

``` javascript
var path = require('path'),
    gulp = require('gulp'),
    Plug = require('gulpplug').Plug,
    tasksDir = 'my-gulp-tasks',
    cwd = path.dirname(__filename),
    plug = new Plug(gulp, tasksDir, cwd);
```


## License

[MIT](http://simbo.mit-license.org/)
