(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Auth-Token', function () {
        beforeEach(module('spi.auth.token'));
        beforeEach(module('spi.constants'));
        beforeEach(module('spi.storage'));
        var TOKENNAME;

        var window;
        var authToken;
        var storage;

        beforeEach(inject(function (_authToken_, $window, _storage_, _AUTH_TOKEN_NAME_) {
            authToken = _authToken_;
            window = $window;
            storage = _storage_;
            TOKENNAME = _AUTH_TOKEN_NAME_;
            storage.remove(TOKENNAME);
        }));

        it('soll einen Token speichern können', function () {
            var token = 'dasIstMeinToken123abc';

            authToken.saveToken(token);

            expect(storage.get(TOKENNAME)).to.be.equal(token);
        });

        it('soll einen Token laden können', function () {
            var token = 'dasIstMeinNeuerToken123abc';
            storage.set(TOKENNAME, token);

            var result = authToken.getToken();

            expect(result).to.be.equal(token);
        });

        it('soll einen Token löschen können', function () {
            storage.set(TOKENNAME, 'dasIstMeinNeuerToken123abc');

            var result = authToken.removeToken();

            expect(result).to.be.undefined;
            expect(storage.get(TOKENNAME)).to.be.undefined;
        });
    });

}());