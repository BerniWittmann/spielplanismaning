exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'ondemand.saucelabs.com:80',
    specs: ['*.spec.js'],
    capabilities: {
        'browserName': 'firefox'
    },
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    sauceSeleniumAddress: 'ondemand.saucelabs.com:80/wd/hub',
    onPrepare: function () {
        console.log(process.env.SAUCE_USERNAME);
        console.log(process.env.SAUCE_ACCESS_KEY);
        var SpecReporter = require('jasmine-spec-reporter');
        // add jasmine spec reporter
        jasmine.getEnv().addReporter(new SpecReporter({displayStacktrace: 'all'}));

        browser.get('http://www.spielplanismaning-testing.herokuapp.com');
    },
    jasmineNodeOpts: {
        print: function () {
        }
    },
    baseUrl: 'http://www.spielplanismaning-testing.herokuapp.com'
};