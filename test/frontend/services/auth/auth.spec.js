(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Auth', function () {
        beforeEach(module('spi.auth'));
        beforeEach(module('spi.constants'));
        var ENDPOINT_BASE_URL = '/api/users';
        var TOKENNAME = 'spielplan-ismaning-token';

        var httpBackend;
        var auth;
        var window;
        var response;
        var responseTest;
        var array = [{
            email: 'Test',
            team: '123'
        }, {
            email: 'Test-Team 2',
            team: '123'
        }, {
            email: 'abc',
            team: '321'
        }];
        var mockState = {
            go: function () {
            }
        };
        var mockLogger = {
            enableLogging: function () {
            },
            disableLogging: function () {
            },
            log: function () {
            }
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('$state', mockState);
                $provide.value('Logger', mockLogger);
            });
        });

        beforeEach(inject(function (_auth_, $httpBackend, $window) {
            auth = _auth_;
            httpBackend = $httpBackend;
            window = $window;
            response = undefined;
        }));

        afterEach(function () {
            if (!_.isUndefined(response)) {
                httpBackend.flush();
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();
                expect(_.isEqual(responseTest, response)).to.be.true;
            }
        });

        it('soll einen Token speichern können', function () {
            window.localStorage.removeItem(TOKENNAME);
            var token = 'dasIstMeinToken123abc';

            auth.saveToken(token);

            expect(window.localStorage[TOKENNAME]).to.be.equal(token);
        });

        it('soll einen Token laden können', function () {
            var token = 'dasIstMeinNeuerToken123abc';
            window.localStorage[TOKENNAME] = token;

            var result = auth.getToken();

            expect(result).to.be.equal(token);
        });

        it('soll zurückgeben ob ein Nutzer eingeloggt ist', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

            var result = auth.isLoggedIn();

            expect(result).to.be.true;
        });

        it('soll den Namen des Nutzers zurückgeben können', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

            var result = auth.currentUser();

            expect(result).to.be.equal('berni');
        });

        it('soll einen neuen Nutzer registrieren können', function () {
            var user = {
                name: 'neuerNutzer',
                password: 'schlechtesPasswort'
            };
            response = user;
            response.token = 'sillyToken123';
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '/register', user).respond(201, response);

            auth.register(user).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll einen Nutzer einloggen', function () {
            var user = {
                name: 'neuerNutzer',
                password: 'schlechtesPasswort'
            };
            response = user;
            response.token = 'sillyToken123';
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '/login', user).respond(201, response);

            auth.logIn(user).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
                expect(window.localStorage[TOKENNAME]).to.be.equal('sillyToken123');
            });
        });

        it('soll einen Nutzer löschen können', function () {
            var username = 'alterNutzer';
            var response = 'User gelöscht';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/delete', {username: username}).respond(201, response);
            auth.canAccess = function () {
                return true;
            };
            var spy = chai.spy.on(auth, 'canAccess');

            auth.deleteUser(username).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
                expect(spy).to.have.been.called();
            });
        });

        it('soll einen Nutzer ausloggen', function () {
            window.localStorage[TOKENNAME] = 'dasIstMeinNeuerToken123abc';
            var spy = chai.spy.on(mockState, 'go');

            auth.logOut();

            expect(window.localStorage[TOKENNAME]).to.be.undefined;
            expect(auth.isLoggedIn()).to.be.false;
            expect(spy).to.have.been.called();
        });

        it('soll prüfen ob ein Nutzer auf einen Bereich zugreifen kann', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

            var result1 = auth.canAccess('admin');
            var result2 = auth.canAccess('bearbeiter');

            expect(result1).to.be.true;
            expect(result2).not.to.be.true;
        });

        it('soll die Rolle laden können', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

            var role = auth.getRole();

            expect(role).to.deep.equal({rank: 1, name: 'admin'});
        });

        it('soll ein leeres Rollen Objekt zurückgeben, wenn kein Token gefunden ist', function () {
            window.localStorage.removeItem(TOKENNAME);
            expect(auth.getToken()).to.be.undefined;

            var role = auth.getRole();

            expect(role).to.deep.equal({
                rank: -1,
                name: undefined
            });
        });

        it('soll zurückgeben ob User ein Admin ist', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg';

            expect(auth.isAdmin()).to.be.true;
            expect(auth.isBearbeiter()).to.be.false;
        });

        it('soll zurückgeben ob User ein Bearbeiter ist', function () {
            window.localStorage[TOKENNAME] = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjowLCJuYW1lIjoiQmVhcmJlaXRlciJ9LCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTQ2OTQ1MzE0MH0.s-MDlitppMFkKZvAx-NWsQQhPNDJL9a0VI3PYSk7k2w';

            expect(auth.isBearbeiter()).to.be.true;
            expect(auth.isAdmin()).to.be.false;
        });

    });

}());