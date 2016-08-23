var gulp = require('gulp'),
    gutil = require('gulp-util'),
    jshint = require('gulp-jshint'),
    Server = require('karma').Server,
    runSequence = require('run-sequence'),
    concatCss = require('gulp-concat-css'),
    clean = require('gulp-clean'),
    cleanCss = require('gulp-clean-css'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    inject = require('gulp-inject'),
    nodemon = require('gulp-nodemon'),
    notify = require('gulp-notify'),
    livereload = require('gulp-livereload'),
    open = require('gulp-open'),
    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version'),
    mocha = require('gulp-mocha');
require('shelljs/global');

gulp.task('default', ['watch']);

// configure which files to watch and what tasks to use on file changes
gulp.task('watch', function () {
    return gulp.watch(['**/*.js', '!public/bower_components/**', '!node_modules/**'], ['watch-task']);
});

gulp.task('watch-task', function () {
    return runSequence('jshint', 'test');
});

gulp.task('inject', function (done) {
    return runSequence('inject:css', 'inject:js', done);
});

gulp.task('inject:css', function () {
    return gulp.src('./views/index.ejs')
        .pipe(inject(
            gulp.src('./public/stylesheets/*.css', {read: false}), {
                starttag: '<!-- injector:css -->',
                endtag: '<!-- endinjector -->',
                transform: function (filepath) {
                    return '<link rel="stylesheet" href="' + filepath.replace('/public/', '') + '">'
                }
            }
        ))
        .pipe(gulp.dest('./views'));
});

gulp.task('inject:js', function () {
    return gulp.src('./views/index.ejs')
        .pipe(inject(
            gulp.src('./public/{components,services,templates}/**/*.js', {read: false}), {
                starttag: '<!-- injector:js -->',
                endtag: '<!-- endinjector -->',
                transform: function (filepath) {
                    return '<script src="' + filepath.replace('/public/', '') + '"></script>'
                }
            }
        ))
        .pipe(gulp.dest('./views'));
});

// jshint task
gulp.task('jshint', function () {
    return gulp.src(['public/**/*.js', '!public/bower_components/**'])
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('jshint-stylish'));
});

// test
gulp.task('test', function (done) {
    return runSequence('test:frontend', 'test:backend', done);
});

gulp.task('test:watch', function (done) {
    return gulp.watch(['**/*.js', 'views/**', '!public/bower_components/**', '!node_modules/**'], ['test'], done);
});

// test frontend
gulp.task('test:frontend', function (done) {
    return new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test:frontend:watch', function (done) {
    return new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: false
    }, done).start();
});

// test backend
gulp.task('test:backend', function (done) {
    gulp.src('routes/**/*spec.js', {read: false})
        .pipe(mocha({
            reporter: 'spec'
        }));
    return done();
});

gulp.task('test:backend:watch', function (done) {
    return gulp.watch(['{models,routes}/**'], ['test:backend'], done);
});

// build
gulp.task('build', function (done) {
    return runSequence('build:clean', ['build:css', 'build:js', 'build:images', 'build:favicon'], done);
});

// clean dist
gulp.task('build:clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

// build css
gulp.task('build:css', function () {
    return gulp.src('public/stylesheets/**/*.css')
        .pipe(concatCss('style.css'))
        .pipe(gulp.dest('public/stylesheets/'))
        .pipe(gp_rename('style.css'))
        .pipe(cleanCss())
        .pipe(gulp.dest('public/stylesheets/'));
});

// build js
gulp.task('build:js', function () {
    return gulp.src(['public/**/*.js', '!public/bower_components/**', '!public/test/**/*.spc.js'])
        .pipe(gp_uglify())
        .pipe(gulp.dest('public'));
});

// build images
gulp.task('build:images', function () {
    return gulp.src('public/assets/img/**')
        .pipe(imagemin())
        .pipe(gulp.dest('public/assets/img/'));
});

// build favicon
gulp.task('build:favicon', function () {
    return gulp.src('public/favicon.png')
        .pipe(imagemin())
        .pipe(gulp.dest('public'));
});

// serve
gulp.task('serve', function (done) {
    runSequence('inject', 'start:server', done);
});

gulp.task('start:server', function () {
    livereload.listen();
    // configure nodemon
    nodemon({
        // the script to run the app
        script: 'app.js',
        ext: 'js html'
    }).on('restart', function () {
        // when the app has restarted, run livereload.
        gulp.src('app.js')
            .pipe(livereload())
            .pipe(notify('Reloading page, please wait...'));
    });
    return runSequence('start:client');
});

gulp.task('start:server:headless', function (done) {
    return nodemon({
        // the script to run the app
        script: 'app.js'
    }).on('start', function () {
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

// versioning
function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}

gulp.task('patch', function () {
    return inc('patch');
});
gulp.task('feature', function () {
    return inc('minor');
});
gulp.task('release', function () {
    return inc('major');
});

//open apps
gulp.task('open', function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://spielplanismaning.herokuapp.com'}));
});

gulp.task('open_testing', function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://spielplanismaning-testing.herokuapp.com'}));
});

