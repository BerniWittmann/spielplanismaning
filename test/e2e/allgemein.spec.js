describe('Navigation', function () {
    var utils = require('./utils.js')();

    beforeAll(function () {
        browser.get(utils.getBaseURI());
    });

    it('soll einen Titel haben', function () {
        expect(browser.getTitle()).toEqual('Spielplan');
    });

    it('soll die Navigation laden', function () {
        var result = element(by.css('spi-navigation'));
        expect(result).toBeDefined();
        expect(result.isDisplayed()).toBeTruthy();
    });

    it('soll die Page laden', function () {
        var result = element(by.id('page'))
        expect(result).toBeDefined();
        expect(result.isDisplayed()).toBeTruthy();
        expect(result.getCssValue('opacity')).not.toBe(0);
    });
});