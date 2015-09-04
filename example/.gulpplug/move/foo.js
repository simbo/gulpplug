'use strict';

module.exports = [
    'moves foo.txt from src/ to dest/',
    function() {
        return this.gulp.src('./src/*')
            .pipe(this.gulp.dest('./dest'));
    }
];
