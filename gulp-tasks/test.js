var gulp = require('gulp');
var runSequence = require('run-sequence');
var Server = require('karma').Server;
var mocha = require('gulp-mocha');
var protractor = require("gulp-protractor").protractor;
var mongobackup = require('mongobackup');
var spawn = require('child_process').spawn;
var mongoose = require('mongoose');
var jshint = require('gulp-jshint');
require('shelljs/global');

gulp.task('test', function (done) {
    return runSequence('test:frontend', 'test:backend', 'test:e2e', done);
});

gulp.task('test:travis', function (done) {
    return runSequence('test:frontend', 'test:backend:withOutWipe', 'test:e2e:testing', done);
});

gulp.task('test:watch', function (done) {
    return gulp.watch(['././src/**/*.js', '././test/*.spec.js', '././src/views/**', '!././src/public/bower_components/**', '!././src/node_modules/**'], ['test'], done);
});

// test frontend
gulp.task('test:frontend', function (done) {
    return new Server({
        configFile: __dirname + '/../karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('test:frontend:watch', function (done) {
    return gulp.watch(['././src/**/*.js', '././test/frontend/**', '././src/views/**', '!././src/public/bower_components/**', '!././src/node_modules/**'], ['test:frontend'], done);
});

// test backend
gulp.task('test:backend', function (done) {
    return runSequence('testDB:wipeAndRestore', 'test:backend:withOutWipe', done);
});

gulp.task('test:backend:withOutWipe', function (done) {
    gulp.src('././test/backend/**/*.spec.js', {read: false})
        .pipe(mocha({
            reporter: 'mochawesome',
            reporterOptions: {
                reportDir: 'docs/tests/backend',
                reportFilename: 'index',
                reportTitle: 'Test-Ergebnisse (Backend)',
                reportPageTitle: 'Test-Ergebnisse (Backend)'
            },
            timeout: 5000
        }))
        .on('error', function (error) {
            throw error;
        })
        .on('end', function () {
            done();
        });
});

gulp.task('test:backend:watch', function (done) {
    return gulp.watch(['././src/{models,routes,test/backend}/**'], ['test:backend'], done);
});

// test DB
gulp.task('testDB:wipeAndRestore', function (done) {
    return runSequence('testDB:wipe', 'testDB:restore', done);
});

gulp.task('testDB:wipe', function (done) {
    mongoose.connect('mongodb://localhost/spielplan-test', function (err) {
        if (err) throw err;
        mongoose.connection.db.dropDatabase(function (err) {
            if (err) throw err;
            mongoose.disconnect(done);
        });
    });
});

gulp.task('testDB:restore', function (done) {
    var DB_SETUP_PATH = __dirname + '/../test/backend/database-setup';
    var LOGGING = false;
    var args = ['--db', 'spielplan-test', '--drop', DB_SETUP_PATH + '/data/spielplan'];
    var mongorestore = spawn(DB_SETUP_PATH + '/mongorestore', args);
    mongorestore.stdout.on('data', function (data) {
        if (LOGGING) console.log('stdout: ' + data);
    });
    mongorestore.stderr.on('data', function (data) {
        if (LOGGING) console.log('stderr: ' + data);
    });
    mongorestore.on('exit', function (code) {
        if (LOGGING) console.log('mongorestore exited with code ' + code);
        done();
    });
});

// test e2e
gulp.task('test:e2e', function (done) {
    return runSequence('test:e2e:local', done);
});

// test e2e local
gulp.task('test:e2e:local', ['start:server'], function (done) {
    gulp.src(['././test/e2e/*.spec.js'])
        .pipe(protractor({
            'configFile': '././test/e2e/protractor.local.config.js'
        }))
        .on('error', function (error) {
            throw error;
        })
        .on('end', function () {
            return done();
        });
});

// test e2e testing
gulp.task('test:e2e:testing', function (done) {
    gulp.src(['././test/e2e/*.spec.js'])
        .pipe(protractor({
            'configFile': '././test/e2e/protractor.testing.config.js'
        }))
        .on('error', function (error) {
            throw error;
        })
        .on('end', function () {
            console.log('END');
            done();
        });
});

// jshint task
gulp.task('jshint', function () {
    return gulp.src(['src/public/**/*.js', 'src/routes/**/*.js', '!src/public/bower_components/**'])
        .pipe(jshint({laxcomma: true}))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});