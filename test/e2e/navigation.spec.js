describe('Navigation', function () {
    var utils = require('./utils.js')();
    var navigation = require('./PageObjects/navigation.js')();

    beforeAll(function (done) {
        browser.get(utils.getBaseURI());
        return done();
    });

    it('Standardmäßig soll die Home-Seite geladen werden', function (done) {
        expect(element(by.css('.page-header h3')).isDisplayed()).toBeTruthy();
        expect(utils.getPageHeaderText()).toEqual('Kinderbeachturnier');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/home');
        return done();
    });

    it('Man soll zur Spielplan-Seite navigieren können', function (done) {
        navigation.klickeNavElement('spielplan');
        expect(utils.getPageHeaderText()).toEqual('Spielplan');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/spielplan');
        return done();
    });

    it('Man soll zur Tabellen-Seite navigieren können', function (done) {
        navigation.klickeNavElement('tabellen');
        expect(utils.getPageHeaderText()).toEqual('Tabellen');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/tabellen');
        return done();
    });

    it('Man soll zur Home-Seite navigieren können', function (done) {
        navigation.klickeNavElement('home');
        expect(utils.getPageHeaderText()).toEqual('Kinderbeachturnier');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/home');
        return done();
    });

    describe('Teeams, Gruppen & Jugenden Dropdown', function () {
        beforeEach(function (done) {
            navigation.klickeNavElement('tgj');
            expect(navigation.isNavDropdownVisible).toBeTruthy();
            return done();
        });

        it('Man soll zur Teams-Seite navigieren können', function (done) {
            navigation.klickeNavElement('tgj-teams');
            expect(utils.getPageHeaderText()).toEqual('Teams');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/teams');
            return done();
        });

        it('Man soll zur Gruppen-Seite navigieren können', function (done) {
            navigation.klickeNavElement('tgj-gruppen');
            expect(utils.getPageHeaderText()).toEqual('Gruppen');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/gruppen');
            return done();
        });

        it('Man soll zur Jugenden-Seite navigieren können', function (done) {
            navigation.klickeNavElement('tgj-jugenden');
            expect(utils.getPageHeaderText()).toEqual('Jugenden');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/jugenden');
            return done();
        });
    });

    it('Man soll zur Login-Seite navigieren können', function (done) {
        navigation.klickeNavElement('login');
        expect(element(by.tagName('h3')).getText()).toEqual('Login');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/login');
        return done();
    });
});