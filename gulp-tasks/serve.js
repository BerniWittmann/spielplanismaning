const gulp = require('gulp');
const runSequence = require('run-sequence');
const nodemon = require('gulp-nodemon');
let notify = require('gulp-notify');
let livereload = require('gulp-livereload');
const open = require('gulp-open');
const forever = require('forever-monitor');
// serve
gulp.task('serve', function (done) {
    runSequence('build', 'start:server', done);
});

gulp.task('serve:dist', function (done) {
    runSequence('build:dist', 'start:server:prod', done);
});

gulp.task('start:server', function (done) {
    const stream = nodemon({
        // the script to run the app
        script: './dist/app.js',
        ignore: ['./../src', './../test']
    });

    stream.on('end', function () {
        done();
    });

    stream.on('crash', function () {
        console.error('Application has crashed!\n');
    });
});

gulp.task('start:server:prod', function () {
    const monitor = new forever.Monitor('./dist/app.js', {
        max: 10,
        minUptime: 3000,
        spinSleepTime: 5000
    });

    monitor.on('restart', function() {
        console.error('Forever restarting script for ' + monitor.times + ' time');
    });

    monitor.on('exit:code', function(code) {
        console.error('Forever detected script exited with code ' + code);
    });

    monitor.start();
});

gulp.task('quit:server', function () {
    exit(1);
});

gulp.task('start:client', function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://localhost:8000'}));
});