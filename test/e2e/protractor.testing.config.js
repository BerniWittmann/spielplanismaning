exports.config = {
    framework: 'jasmine',
    specs: ['*.spec.js'],
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    getPageTimeout: 20000,
    allScriptsTimeout: 10000,
    rootElement : 'body',
    capabilities: {
        'browserName': 'firefox',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'name': 'Travis Test Testing #' + process.env.TRAVIS_BUILD_NUMBER
    },
    onPrepare: function () {
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));

        process.env.TEST_BASE_URI = 'http://spielplanismaning-testing.herokuapp.com';

    },
    jasmineNodeOpts: {
        print: function () {
        }
    }
};