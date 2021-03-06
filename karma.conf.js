// Karma configuration
// Generated on Sat Jul 16 2016 15:39:16 GMT+0200 (CEST)

module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: 'src/public',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'chai-spies', 'chai'],

        // list of files / patterns to load in the browser
        files: [
            //include bower dependecies
            '../../dist/public/bower_components/jquery/dist/jquery.js',
            '../../dist/public/bower_components/jquery-ui/jquery-ui.min.js',
            '../../dist/public/bower_components/angular/angular.js',
            '../../dist/public/bower_components/angular-mocks/angular-mocks.js',
            '../../dist/public/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
            '../../dist/public/bower_components/angular-ui-router/release/angular-ui-router.js',
            '../../dist/public/bower_components/angular-sanitize/angular-sanitize.js',
            '../../dist/public/bower_components/moment/moment.js',
            '../../dist/public/bower_components/lodash/lodash.js',
            '../../dist/public/bower_components/angular-toastr/dist/angular-toastr.tpls.js',
            '../../node_modules/chai-jquery/chai-jquery.js',
            '../../dist/public/bower_components/ng-table/dist/ng-table.js',
            '../../dist/public/bower_components/angular-local-storage/dist/angular-local-storage.js',
            '../../dist/public/bower_components/flipclock/compiled/flipclock.js',
            '../../dist/public/bower_components/angular-md5/angular-md5.js',
            '../../dist/public/bower_components/angular-ui-sortable/sortable.js',
            '../../dist/public/bower_components/angular-flatpickr/dist/ng-flatpickr.js',
            '../../dist/public/bower_components/flatpickr-calendar/dist/flatpickr.js',
            '../../dist/public/bower_components/flatpickr-calendar/dist/l10n/de.js',
            //include src files
            '{components,templates,services}/**/*.js',
            '{components,templates}/**/*.html',
            '{components,templates}/**/*.html.ext',
            //include spec files
            '../../test/frontend/**/*.spec.js'

        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '{components,templates}/**/*.html': ['ng-html2js'],
            '{{components,templates,services}/**/*.js, app.js}': ['babel', 'coverage']
        },

        babelPreprocessor: {
            options: {
                presets: ['es2015']
            }
        },

        ngHtml2JsPreprocessor: {
            // strip this from the file path
            stripPrefix: 'public/',
            stripSuffix: '.ext',
            // prepend this to the
            prependPrefix: 'served/',

            // or define a custom transform function
            // - cacheId returned is used to load template
            //   module(cacheId) will return template at filepath
            cacheIdFromPath: function(filepath) {
                // example strips 'public/' from anywhere in the path
                // module(app/templates/template.html) => app/public/templates/template.html
                const cacheId = filepath.replace('public/', '');
                return cacheId;
            },

            // - setting this option will create only a single module that contains templates
            //   from all the files, so you can load them all with module('foo')
            // - you may provide a function(htmlPath, originalPath) instead of a string
            //   if you'd like to generate modules dynamically
            //   htmlPath is a originalPath stripped and/or prepended
            //   with all provided suffixes and prefixes
            moduleName: 'htmlModule'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['mocha', 'htmlalt', 'coverage'],

        htmlReporter: {
            outputFile: '../../docs/tests/frontend/index.html',

            // Optional
            pageTitle: 'Test-Ergebnisse (Frontend)',
            subPageTitle: 'Unit-Tests des Frontends'
        },

        coverageReporter: {
            reporters: [
                { type: 'lcovonly', subdir: '.' }
            ],
            dir : 'coverage/'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_WARN,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        browserNoActivityTimeout: 10000,
        browserDisconnectTolerance: 3,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 1
    })
};
