const gulp = require('gulp');
const runSequence = require('run-sequence');
const open = require('gulp-open');
const git = require('gulp-git');
const bump = require('gulp-bump');
const filter = require('gulp-filter');
const tag_version = require('gulp-tag-version');
const apidoc = require('gulp-apidoc');
const watch = require('gulp-watch');

require('require-dir')('./gulp-tasks');

gulp.task('default', ['serve-and-watch']);

// configure which files to watch and what tasks to use on file changes
gulp.task('serve-and-watch', function () {
    return runSequence('serve', 'watch-task');
});

gulp.task('build-and-watch', function () {
   return runSequence('build', 'watch-task');
});

gulp.task('watch-task', function () {
    return watch('src/**', {ignoreInitial: true}, function () {
        console.log('File changes detected... Rebuilding...');
    }).pipe(gulp.dest('dist/'));
});

// versioning
function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json', './apidoc.json'])
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
gulp.task('apidoc', function () {
    return apidoc({
        src: "src/routes",
        dest: "docs/api",
        config: "./",
        includeFilters: [".*\\.js$"]
    }, function () {
        gulp.src('docs/api/*')
            .pipe(git.commit('updated apidoc'));
    });
});

gulp.task('apidoc:nocommit', function (done) {
    return apidoc({
        src: "./src/routes",
        dest: "./docs/api/",
        config: "./",
        includeFilters: [".*\\.js$"]
    }, done);
});

gulp.task('pre-commit', ['test:precommit']);

