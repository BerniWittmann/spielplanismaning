exports.config = {
    framework: 'jasmine',
    seleniumAddress: 'ondemand.saucelabs.com:80/wd/hub',
    specs: ['*.spec.js'],
    sauceUser: process.env.SAUCE_USERNAME,
    sauceKey: process.env.SAUCE_ACCESS_KEY,
    sauceSeleniumAddress: 'ondemand.saucelabs.com:80/wd/hub',
    capabilities: {
        'browserName': 'chrome',
        'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
        'build': process.env.TRAVIS_BUILD_NUMBER
    },
    baseUrl: 'http://www.spielplanismaning-testing.herokuapp.com'
};