var gulp = require('gulp');
var runSequence = require('run-sequence');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var livereload = require('gulp-livereload');
var open = require('gulp-open');
// serve
gulp.task('serve', function (done) {
    runSequence('build', 'start:server', done);
});

gulp.task('serve:dist', function (done) {
    runSequence('build:dist', 'start:server', done);
});

gulp.task('start:server', function (done) {
    nodemon({
        // the script to run the app
        script: './dist/app.js',
        ignore: ['./../src', './../test']
    }).on('end', function () {
        done();
    });
});

gulp.task('quit:server', function () {
    exit(1);
});

gulp.task('start:client', function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:8000'}));
});