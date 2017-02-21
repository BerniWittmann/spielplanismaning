var gulp = require('gulp');
var runSequence = require('run-sequence');
var concatCss = require('gulp-concat-css');
var clean = require('gulp-clean');
var cleanCss = require('gulp-clean-css');
var gp_uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var imagemin = require('gulp-imagemin');
var concatJs = require('gulp-concat');
var templateCache = require('gulp-angular-templatecache');
var htmlmin = require('gulp-htmlmin');
var ngAnnotate = require('gulp-ng-annotate');
var sourcemaps = require('gulp-sourcemaps');


var uglify = false;

// build
gulp.task('build', function (done) {
    uglify = false;
    return runSequence('build:sequence', done);

});

gulp.task('build:dist', function (done) {
    uglify = true;
    return runSequence('inject:modules', 'build:sequence', done);
});

gulp.task('build:sequence', function (done) {
    return runSequence('clean:build', ['build:css', 'build:js', 'build:images', 'build:favicon', 'build:html', 'build:bower', 'build:etc'], 'inject', 'build:views', 'clean:tmp', done);
});

// clean dist
gulp.task('clean:build', function () {
    return gulp.src('./dist', {read: false})
        .pipe(clean());
});

gulp.task('clean:tmp', function () {
    return gulp.src('./tmp', {read: false})
        .pipe(clean());
});

// build css
gulp.task('build:css', function () {
    gulp.src('./src/public/stylesheets/fonts/**')
        .pipe(gulp.dest('./dist/public/stylesheets/fonts'));
    if (uglify) {
        return gulp.src('./src/public/stylesheets/**/*.css')
            .pipe(concatCss('style.css'))
            .pipe(cleanCss())
            .pipe(gulp.dest('./dist/public/stylesheets/'));
    } else {
        return gulp.src('./src/public/stylesheets/**/*.css')
            .pipe(gulp.dest('./dist/public/stylesheets/'));
    }
});

// build js
gulp.task('build:js', function (done) {
    return runSequence(['build:js:nodeApp', 'build:js:angular'], done);
});

gulp.task('build:js:angular', function () {
    if (uglify) {
        return gulp.src(['./tmp/app.js', './src/public/**/*.js', '!./src/public/bower_components/**', '!./src/public/app.js'])
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(ngAnnotate())
            .pipe(concatJs('app.js'))
            .pipe(gp_uglify())
            .pipe(gulp.dest('./dist/public'));
    } else {
        return gulp.src(['./src/public/**/*.js', '!./src/public/bower_components/**'])
            .pipe(gulp.dest('./dist/public'));
    }
});

// build app.js
gulp.task('build:js:nodeApp', function () {
    if (uglify) {
        return gulp.src(['./src/**/*.js', '!./src/public/**/*.js', '!./src/public/*.js'])
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(gp_uglify())
            .pipe(gulp.dest('./dist'));
    } else {
        return gulp.src(['./src/**/*.js', '!./src/public/**/*.js', '!./src/public/*.js'])
            .pipe(gulp.dest('./dist'));
    }
});

//build bower components
gulp.task('build:bower', function () {
    return gulp.src('./src/public/bower_components/**/**')
        .pipe(gulp.dest('./dist/public/bower_components'));
});

//build html
gulp.task('build:html', function () {
    if (uglify) {
        return gulp.src(['./src/public/**/*.html', '!./src/public/bower_components/**'])
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(templateCache('templates.js', {standalone: true}))
            .pipe(gp_uglify())
            .pipe(gulp.dest('./dist/public'));
    } else {
        return gulp.src(['./src/public/**/*.html', '!./src/public/bower_components/**'])
            .pipe(gulp.dest('./dist/public'));
    }
});

//build views
gulp.task('build:views', function () {
    if (uglify) {
        return gulp.src('./dist/views/*.ejs')
            .pipe(htmlmin({collapseWhitespace: true}))
            .pipe(gulp.dest('./dist/views'));
    }
});

// build images
gulp.task('build:images', function () {
    return gulp.src('./src/public/assets/img/**')
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/public/assets/img/'));
});

// build favicon
gulp.task('build:favicon', function () {
    return gulp.src(['./src/public/favicon.png', './src/public/favicon.ico'])
        .pipe(imagemin())
        .pipe(gulp.dest('./dist/public'));
});

// build etc
gulp.task('build:etc', function () {
    return gulp.src(['./src/**/*.json', './src/**/emailTemplates/*.ejs'])
        .pipe(gulp.dest('./dist'));
});