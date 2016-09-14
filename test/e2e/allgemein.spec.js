describe('Spielplan-Ismaning App', function () {
    it('soll einen Titel haben', function () {
        expect(browser.getTitle()).toEqual('Spielplan');
    });

    it('soll die Navigation laden', function () {
        var result = element(by.css('spi-navigation'));
        expect(result).toBeDefined();
        expect(result.isDisplayed()).toBeTruthy();
    });
});