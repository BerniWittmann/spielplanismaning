(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Storage', function () {
        beforeEach(module('spi.constants'));
        beforeEach(module('spi.storage'));
        beforeEach(module('LocalStorageModule'));
        var TOKENNAME = 'test-token';
        var token = 'dasIstMeinToken[123}&abc/';
        var encryptedToken;

        var window;
        var storage;
        var storeService;

        beforeEach(inject(function ($window, _storage_, localStorageService) {
            window = $window;
            storage = _storage_;
            encryptedToken = $window.btoa(token);
            storeService = localStorageService;
            storeService.remove(TOKENNAME);
        }));

        it('soll einen Token speichern können', function () {
            storage.set(TOKENNAME, token);

            expect(storeService.get(TOKENNAME)).to.exist;
            expect(window.localStorage['ls.' + TOKENNAME]).to.exist;
        });

        it('soll einen Token sicher speichern können', function () {
            storage.set(TOKENNAME, token);

            expect(storeService.get(TOKENNAME)).to.exist;
            expect(storeService.get(TOKENNAME)).to.equal(encryptedToken);
            expect(storeService.get(TOKENNAME)).to.not.equal(token);
            expect(window.localStorage['ls.' + TOKENNAME]).to.exist;
            expect(window.localStorage['ls.' + TOKENNAME]).to.equal('"' + encryptedToken + '"');
            expect(window.localStorage['ls.' + TOKENNAME]).to.not.equal('"' + token + '"');
        });

        it('soll einen Token laden können', function () {
            storeService.set(TOKENNAME, encryptedToken);

            var result = storage.get(TOKENNAME);

            expect(result).to.be.equal(token);
        });

        it('bei einem falschen Tokennamen soll nichts zurückgegeben werden', function () {
            storeService.set(TOKENNAME, encryptedToken);

            var result = storage.get('FALSCHER_tOkEnNaMe');

            expect(result).to.be.undefined;
        });

        it('soll einen Token löschen können', function () {
            storeService.set(TOKENNAME, encryptedToken);

            storage.remove(TOKENNAME);

            expect(storeService.get(TOKENNAME)).not.to.exist;
        });
    });
}());