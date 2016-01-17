'use strict';

module.exports = [
  'Awesome task',
  'first',
  function(done) {
    this.util.log('Hello!');
    setTimeout(function() {
      this.util.log('Done.');
      done();
    }.bind(this), 100);
  }
];
