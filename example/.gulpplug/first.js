'use strict';

module.exports = [
  'First function',
  function(done) {
    this.util.log('I\'m running first…');
    done();
  }
];
