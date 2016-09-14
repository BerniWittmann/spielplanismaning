exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'ondemand.saucelabs.com:80',
    specs: ['*.spec.js'],
    capabilities: {
        'browserName': 'firefox'
    },
    sauceUser: 'BerniWittmann',
    sauceKey: 'd0e5251a-18e3-49d9-b478-6136db1244f3',
    sauceSeleniumAddress: 'ondemand.saucelabs.com:80/wd/hub',
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