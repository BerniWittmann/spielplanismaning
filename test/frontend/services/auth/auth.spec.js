(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Auth', function () {
        beforeEach(module('spi.auth'));
        beforeEach(module('spi.constants'));
        var ENDPOINT_BASE_URL = '/api/users';
        var TOKENNAME;

        var httpBackend;
        var auth;
        var window;
        var storage;
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

        beforeEach(inject(function (_auth_, $httpBackend, $window, _storage_, _AUTH_TOKEN_NAME_) {
            auth = _auth_;
            httpBackend = $httpBackend;
            window = $window;
            response = undefined;
            storage = _storage_;
            TOKENNAME = _AUTH_TOKEN_NAME_;
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
            storage.remove(TOKENNAME);
            var token = 'dasIstMeinToken123abc';

            auth.saveToken(token);

            expect(storage.get(TOKENNAME)).to.be.equal(token);
        });

        it('soll einen Token laden können', function () {
            var token = 'dasIstMeinNeuerToken123abc';
            storage.set(TOKENNAME, token);

            var result = auth.getToken();

            expect(result).to.be.equal(token);
        });

        it('soll zurückgeben ob ein Nutzer eingeloggt ist', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');

            var result = auth.isLoggedIn();

            expect(result).to.be.true;
        });

        it('soll den Namen des Nutzers zurückgeben können', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');

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
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
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
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
                expect(storage.get(TOKENNAME)).to.be.equal('sillyToken123');
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
            storage.set(TOKENNAME, 'dasIstMeinNeuerToken123abc');
            var spy = chai.spy.on(mockState, 'go');

            auth.logOut();

            expect(window.localStorage[TOKENNAME]).to.be.undefined;
            expect(auth.isLoggedIn()).to.be.false;
            expect(spy).to.have.been.called();
        });

        it('soll prüfen ob ein Nutzer auf einen Bereich zugreifen kann', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');

            var result1 = auth.canAccess('admin');
            var result2 = auth.canAccess('bearbeiter');

            expect(result1).to.be.true;
            expect(result2).not.to.be.true;
        });

        it('soll die Rolle laden können', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');

            var role = auth.getRole();

            expect(role).to.deep.equal({rank: 1, name: 'admin'});
        });

        it('soll ein leeres Rollen Objekt zurückgeben, wenn kein Token gefunden ist', function () {
            storage.remove(TOKENNAME);
            expect(auth.getToken()).to.be.undefined;

            var role = auth.getRole();

            expect(role).to.deep.equal({
                rank: -1,
                name: undefined
            });
        });

        it('soll zurückgeben ob User ein Admin ist', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');

            expect(auth.isAdmin()).to.be.true;
            expect(auth.isBearbeiter()).to.be.false;
        });

        it('soll zurückgeben ob User ein Bearbeiter ist', function () {
            storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjowLCJuYW1lIjoiQmVhcmJlaXRlciJ9LCJleHAiOjk5OTk5OTk5OTksImlhdCI6MTQ2OTQ1MzE0MH0.s-MDlitppMFkKZvAx-NWsQQhPNDJL9a0VI3PYSk7k2w');

            expect(auth.isBearbeiter()).to.be.true;
            expect(auth.isAdmin()).to.be.false;
        });

        describe('soll prüfen ob eine Route zugänglich ist', function () {
            var toState = {
                name: 'toStateName',
                data: {
                    requiredRoles: ['admin']
                }
            };

            var q = {
                when: function () {},
                reject: function () {}
            };
            before(function () {
                storage.set(TOKENNAME, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjo5OTk5OTk5OTk5LCJpYXQiOjE0Njk0NTMxNDB9.S7Cfr8ZcB4v5l0OAQc3-jCrXkb4O7-I_qzGjykSwsQg');
            });

            it('wenn keine State-Daten angegeben sind, soll die Route zugänglich sein', function () {
                toState.data = undefined;
                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                expect(spyState).not.to.have.been.called();
                expect(spyReject).not.to.have.been.called();
                expect(spyResolve).to.have.been.called();
            });

            it('wenn keine benötigten Rollen angegeben sind, soll die Route zugänglich sein', function () {
                toState.data = {
                    requiredRoles: undefined
                };
                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                expect(spyState).not.to.have.been.called();
                expect(spyReject).not.to.have.been.called();
                expect(spyResolve).to.have.been.called();
            });

            it('wenn ein leeres Feld von benötigten Rollen angegeben sind, soll die Route zugänglich sein', function () {
                toState.data = {
                    requiredRoles: []
                };
                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                expect(spyState).not.to.have.been.called();
                expect(spyReject).not.to.have.been.called();
                expect(spyResolve).to.have.been.called();
            });

            it('wenn die benötigte Rolle in einem Array angegeben ist, soll die Route zugänglich sein', function () {
                toState.data = {
                    requiredRoles: ['admin']
                };
                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                expect(spyState).not.to.have.been.called();
                expect(spyReject).not.to.have.been.called();
                expect(spyResolve).to.have.been.called();
            });

            it('wenn die benötigte Rolle nicht erfüllt ist, soll die Route nicht zugänglich sein', inject(function($timeout) {
                toState.data = {
                    requiredRoles: ['bearbeiter']
                };

                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                $timeout.flush();

                expect(spyState).to.have.been.called();
                expect(spyReject).to.have.been.called();
                expect(spyResolve).not.to.have.been.called();
            }));

            it('wenn Nutzer gar keine Rolle hat, soll die Route nicht zugänglich sein', inject(function($timeout) {
                toState.data = {
                    requiredRoles: ['bearbeiter']
                };

                var spyState = chai.spy.on(mockState, 'go');
                var spyResolve = chai.spy.on(q, 'when');
                var spyReject = chai.spy.on(q, 'reject');

                auth.checkRoute(q, toState);

                $timeout.flush();

                expect(spyState).to.have.been.called();
                expect(spyReject).to.have.been.called();
                expect(spyResolve).not.to.have.been.called();
            }));
        });

        it('soll ein neues Passwort anfordern können', function () {
            var email = 'test@byom.de';
            var response = 'SUCCESS';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/password-forgot', {email: email}).respond(201, response);

            auth.forgotPassword(email).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll prüfen ob ein ResetToken zum Passwort Zurücksetzen gültig ist', function () {
            var token = '1234abcd';
            var response = 'SUCCESS';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/password-forgot/check', {token: token}).respond(201, response);

            auth.checkResetToken(token).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll ein Passwort zurücksetzen können', function () {
            var username = 'username';
            var password = 'password';
            var token = '123abc';
            var response = 'SUCCESS';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/password-reset', {username: username, password: password, token: token}).respond(201, response);

            auth.resetPassword(username, token, password).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll die Nutzerdetails laden', function () {
            var response = 'SUCCESS';
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/user-details').respond(201, response);

            auth.getUserDetails().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll die Nutzerdetails setzen können', function () {
            var data = {
                username: 'test',
                email: 'test@byom.de'
            };
            var response = 'SUCCESS';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/user-details', data).respond(201, response);

            auth.setUserDetails(data).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });
    });

}());