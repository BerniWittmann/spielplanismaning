describe('Navigation', function () {
    var utils = require('./utils.js')();
    var navigation = require('./PageObjects/navigation.js')();

    beforeAll(function () {
        browser.get(utils.getBaseURI());
    });

    it('Standardmäßig soll die Home-Seite geladen werden', function () {
        expect(element(by.css('.page-header h3')).isDisplayed()).toBeTruthy();
        expect(utils.getPageHeaderText()).toEqual('Kinderbeachturnier');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/home');
    });

    it('Man soll zur Spielplan-Seite navigieren können', function () {
        navigation.klickeNavElement('spielplan');
        expect(utils.getPageHeaderText()).toEqual('Spielplan');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/spielplan');
    });

    it('Man soll zur Tabellen-Seite navigieren können', function () {
        navigation.klickeNavElement('tabellen');
        expect(utils.getPageHeaderText()).toEqual('Tabellen');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/tabellen');
    });

    it('Man soll zur Home-Seite navigieren können', function () {
        navigation.klickeNavElement('home');
        expect(utils.getPageHeaderText()).toEqual('Kinderbeachturnier');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/home');
    });

    describe('Teeams, Gruppen & Jugenden Dropdown', function () {
        beforeEach(function () {
            navigation.klickeNavElement('tgj');
            expect(navigation.isNavDropdownVisible).toBeTruthy();
        });

        it('Man soll zur Teams-Seite navigieren können', function () {
            navigation.klickeNavElement('tgj-teams');
            expect(utils.getPageHeaderText()).toEqual('Teams');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/teams');
        });

        it('Man soll zur Gruppen-Seite navigieren können', function () {
            navigation.klickeNavElement('tgj-gruppen');
            expect(utils.getPageHeaderText()).toEqual('Gruppen');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/gruppen');
        });

        it('Man soll zur Jugenden-Seite navigieren können', function () {
            navigation.klickeNavElement('tgj-jugenden');
            expect(utils.getPageHeaderText()).toEqual('Jugenden');
            expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/jugenden');
        });
    });

    it('Man soll zur Login-Seite navigieren können', function () {
        navigation.klickeNavElement('login');
        expect(element(by.tagName('h3')).getText()).toEqual('Login');
        expect(browser.getCurrentUrl()).toEqual(utils.getBaseURI() + '/login');
    });
});