exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'ondemand.saucelabs.com:80',
    specs: ['*.spec.js'],
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    sauceSeleniumAddress: 'ondemand.saucelabs.com:80/wd/hub',
    capabilities: {
        'browserName': 'firefox',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER,
        'name': 'Travis Test on Testing'
    },
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