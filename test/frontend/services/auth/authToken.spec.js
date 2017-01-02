(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Auth-Token', function () {
        beforeEach(module('spi.auth.token'));
        var TOKENNAME = 'spielplan-ismaning-token';

        var window;
        var authToken;

        beforeEach(inject(function (_authToken_, $window) {
            authToken = _authToken_;
            window = $window;
        }));

        it('soll einen Token speichern können', function () {
            window.localStorage.removeItem(TOKENNAME);
            var token = 'dasIstMeinToken123abc';

            authToken.saveToken(token);

            expect(window.localStorage[TOKENNAME]).to.be.equal(token);
        });

        it('soll einen Token laden können', function () {
            var token = 'dasIstMeinNeuerToken123abc';
            window.localStorage[TOKENNAME] = token;

            var result = authToken.getToken();

            expect(result).to.be.equal(token);
        });

        it('soll einen Token löschen können', function () {
            window.localStorage[TOKENNAME] = 'dasIstMeinNeuerToken123abc';

            var result = authToken.removeToken();

            expect(result).to.be.undefined;
        });
    });

}());