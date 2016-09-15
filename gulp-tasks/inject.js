var gulp = require('gulp');
var runSequence = require('run-sequence');
var inject = require('gulp-inject');

gulp.task('inject', function (done) {
    return runSequence('moveViews', 'inject:css', 'inject:js', done);
});

gulp.task('moveViews', function () {
    return gulp.src('./src/views/*.ejs')
        .pipe(gulp.dest('./dist/views'));
});

gulp.task('inject:css', function () {
    return gulp.src('./dist/views/index.ejs')
        .pipe(inject(
            gulp.src('./dist/public/stylesheets/*.css', {read: false}), {
                starttag: '<!-- injector:css -->',
                endtag: '<!-- endinjector -->',
                transform: function (filepath) {
                    return '<link rel="stylesheet" href="' + filepath.replace('/dist/public/', '') + '">'
                }
            }
        ))
        .pipe(gulp.dest('./dist/views'));
});

gulp.task('inject:js', function () {
    return gulp.src('./dist/views/index.ejs')
        .pipe(inject(
            gulp.src(['./dist/public/**/*.js', '!./dist/public/bower_components/**'], {read: false}), {
                starttag: '<!-- injector:js -->',
                endtag: '<!-- endinjector -->',
                transform: function (filepath) {
                    return '<script src="' + filepath.replace('/dist/public/', '') + '"></script>'
                }
            }
        ))
        .pipe(gulp.dest('./dist/views'));
});