'use strict';

module.exports = [
    'Awesome task',
    function(done) {
        this.util.log('Hello!');
        setTimeout(function() {
            this.util.log('Done.');
            done();
        }.bind(this), 100);
    }
];
