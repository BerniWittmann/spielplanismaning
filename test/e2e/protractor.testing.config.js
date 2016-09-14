exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'ondemand.saucelabs.com:80',
    specs: ['*.spec.js'],
    capabilities: {
        'browserName': 'firefox'
    },
    onPrepare: function () {
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));

        browser.get('www.spielplanismaning-testing.herokuapp.com');
    },
    jasmineNodeOpts: {
        print: function () {
        }
    },
    baseUrl: 'www.spielplanismaning-testing.herokuapp.com'
};