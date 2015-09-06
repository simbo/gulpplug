gulpplug
========

  > A toolkit for 
  > [gulp](https://github.com/gulpjs/gulp), 
  > which can require task files, auto-load gulp plugins and offer some sugar.

[![gulpplug](https://raw.github.com/simbo/gulpplug/master/gulpplug.png)](https://github.com/simbo/gulpplug)

[![npm Package Version](https://img.shields.io/npm/v/gulpplug.svg?style=flat-square)](https://www.npmjs.com/package/gulpplug)
[![MIT License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://simbo.mit-license.org)
[![Travis Build Status](https://img.shields.io/travis/simbo/gulpplug/master.svg?style=flat-square)](https://travis-ci.org/simbo/gulpplug)

[![Dependencies Status](https://img.shields.io/david/simbo/gulpplug.svg?style=flat-square)](https://david-dm.org/simbo/gulpplug)
[![devDependencies Status](https://img.shields.io/david/dev/simbo/gulpplug.svg?style=flat-square)](https://david-dm.org/simbo/gulpplug#info=devDependencies)
[![Code Climate GPA](https://img.shields.io/codeclimate/github/simbo/gulpplug.svg?style=flat-square)](https://codeclimate.com/github/simbo/gulpplug)
[![Code Climate Test Coverage](https://img.shields.io/codeclimate/coverage/github/simbo/gulpplug.svg?style=flat-square)](https://codeclimate.com/github/simbo/gulpplug)

---

<!-- MarkdownTOC -->

- [About *gulpplug*](#about-gulpplug)
- [Install](#install)
- [Quick Start](#quick-start)
- [Usage](#usage)
    - [Create your `Plug` instance](#create-your-plug-instance)
    - [Options](#options)
    - [Defining Tasks](#defining-tasks)
    - [Help task and descriptions](#help-task-and-descriptions)
    - [Loading gulp plugins](#loading-gulp-plugins)
    - [Plug Class](#plug-class)
- [License](#license)

<!-- /MarkdownTOC -->


## About *gulpplug*

*gulpplug*'s main purpose is to [glob](https://github.com/isaacs/node-glob) 
some files and `require` them to create 
[gulp](https://github.com/gulpjs/gulp) tasks. This way you can organize your 
tasks in multiple files and folders. You can define task descriptions from 
which *gulpplug* can creates a help task listing all available tasks.

Within your task function context you can access your current instance of `Plug`
, *gulpplug*'s main class, via `this` and find gulp at `this.gulp`.
*gulpplug* also offers [gulp-util](https://github.com/gulpjs/gulp-util) 
(`this.util`), [run-sequence](https://github.com/OverZealous/run-sequence) 
(`this.runSequence`) and your gulp plugins (`this.plugins`), which can be 
auto-loaded using [auto-plug](https://github.com/simbo/auto-plug).


## Install

*gulpplug* doesn't include gulp and is useless without it, so you obviously 
have to install both. Use npm:

``` bash
npm i -S gulp gulpplug
```


## Quick Start

Your `Gulpfile.js` could look like this:

``` javascript
var gulp = require('gulp'),
    plug = require('gulpplug')(gulp);

plug.loadPlugins()
    .addTasks()
    .addHelpTask();
```

Let's say, you want to create a gulp task called `minify` to pipe some 
javascript files through `gulp-uglify`, which you have installed as dependency. 

Go ahead and create the file `.gulpplug/minify.js` containing:

``` javascript
module.exports = function() {
    return this.gulp.src('./src/*.js')
        .pipe(this.plugins.uglify())
        .pipe(this.gulp.dest('./dist'));
}
```


## Usage


### Create your `Plug` instance

`Plug` is *gulpplug*'s main class. It needs your current gulp instance as first
argument and accepts an options object as second argument.

You can create your `Plug` instance by calling the required main function…

``` javascript
var gulp = require('gulp'),
    plug = require('gulpplug')(gulp);
```

…or require the class definition and call `new`:

``` javascript
var gulp = require('gulp'),
    Plug = require('gulpplug').Plug
    plug = new Plug(gulp);
```


### Options


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
[`run-sequence`]() as properties. 
(As well as other properties and methods you may want to use - take a look at 
the [sourcecode](https://github.com/simbo/gulpplug/blob/master/lib/plug.js).)

``` javascript
module.exports = function(done) {
    this.util.log(this.chalk.green('Starting async things…'));
    setTimeout(function() {
        this.util.log(this.chalk.red('Async stuff done.'));
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
will be used to load gulp plugins defined in your project's `package.json`. You
can set auto-plug options as first argument.


### Plug Class

By calling `require('gulpplug')(…)` you get a new instance of `Plug`, which 
expects `gulp` as first argument and an optional options object as second 
argument.

You can also access the class directly.

``` javascript
var path = require('path'),
    gulp = require('gulp'),
    Plug = require('gulpplug').Plug,
    plug = new Plug(gulp, {
        cwd: path.dirname(__filename),
        tasksDir: 'my-gulp-tasks'
    });
```


## License

[MIT &copy; 2015 Simon Lepel](http://simbo.mit-license.org/)
