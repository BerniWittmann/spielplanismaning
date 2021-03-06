describe('Spielplan-Ismaning App', function () {
    var utils = require('./utils.js')();

    beforeAll(function (done) {
        return utils.loadPage(browser).then(done);
    });

    it('soll einen Titel haben', function (done) {
        expect(browser.getTitle()).toEqual('Spielplan');
        return done();
    });

    it('soll die Navigation laden', function (done) {
        var result = element(by.css('spi-navigation'));
        expect(result).toBeDefined();
        expect(result.isDisplayed()).toBeTruthy();
        return done();
    });

    it('soll die Page laden', function (done) {
        var result = element(by.id('page'));
        expect(result).toBeDefined();
        expect(result.isDisplayed()).toBeTruthy();
        expect(result.getCssValue('opacity')).not.toBe(0);
        return done();
    });
});