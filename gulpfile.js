var gulp = require('gulp');
var jshint = require('gulp-jshint');
var runSequence = require('run-sequence');
var open = require('gulp-open');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');
var apidoc = require('gulp-apidoc');
var watch = require('gulp-watch');

require('require-dir')('./gulp-tasks');

gulp.task('default', ['build-and-watch']);

// configure which files to watch and what tasks to use on file changes
gulp.task('build-and-watch', function () {
    return runSequence('serve', 'watch-task');
});

gulp.task('watch-task', function () {
    return watch('src/**', {ignoreInitial: true})
        .pipe(gulp.dest('dist/'));
});

// jshint task
gulp.task('jshint', function () {
    return gulp.src(['src/public/**/*.js', 'src/routes/**/*.js', '!src/public/bower_components/**'])
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('jshint-stylish'));
});

// versioning
function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json', './src/routes/apidoc.json'])
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

gulp.task('open:testing', function () {
    gulp.src(__filename)
        .pipe(open({uri: 'http://spielplanismaning-testing.herokuapp.com'}));
});

// api doc
gulp.task('apidoc', function (done) {
    apidoc({
        src: "src/routes",
        dest: "docs",
        includeFilters: [".*\\.js$"]
    }, done);
});

