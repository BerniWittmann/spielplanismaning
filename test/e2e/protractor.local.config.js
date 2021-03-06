exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'http://localhost:4444/wd/hub',
    specs: ['*.spec.js'],
    capabilities: {
        'browserName': 'firefox'
    },
    rootElement : 'body',
    onPrepare: function () {
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));

        process.env.TEST_BASE_URI = 'http://localhost:8000';
    },
    jasmineNodeOpts: {
        print: function () {
        }
    }
};