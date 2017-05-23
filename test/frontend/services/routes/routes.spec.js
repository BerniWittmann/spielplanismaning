(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Routes', function () {
        beforeEach(module('spi.routes'));

        var httpBackend;
        var response;
        var responseTest;
        var routes;
        var methods = ['GET', 'PUT', 'POST', 'DELETE'];
        var url = '/url/test';

        var mockErrorHandler = {
            handleResponseError: function () {
            }
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(inject(function (_routes_, $httpBackend) {
            routes = _routes_;
            httpBackend = $httpBackend;
            response = undefined;
        }));

        afterEach(function () {
            if (!_.isUndefined(response)) {
                httpBackend.verifyNoOutstandingExpectation();
                httpBackend.verifyNoOutstandingRequest();
                expect(_.isEqual(responseTest, response)).to.equal(true);
            }
        });

        describe('soll die verschiedenen Methoden ausführen können', function () {
            it('soll die verschiedenen Methoden zur Verfügung stellen', function () {
                expect(routes.methods).to.have.all.keys(methods);
            });

            _.forEach(methods, function (method) {
                it('soll einen ' + method + ' Request ausführen können', function (done) {
                    response = 'Success';
                    httpBackend.expect(method, url).respond(200, response);

                    routes.requestMethodParamsData(method, url, undefined, undefined).then(function (res) {
                        responseTest = res;
                        expect(_.isEqual(res, response)).to.be.true;
                        return done();
                    });
                    httpBackend.flush();
                });
            });
        });

        describe('soll Parameter an die Url hinzufügen', function () {
            it('soll eine Url ohne parameter ansprechen', function (done) {
                response = 'Success';
                httpBackend.expect('GET', url).respond(200, response);

                routes.requestMethodParamsData('GET', url, undefined, {}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('soll eine Url mit einem parameter ansprechen', function (done) {
                response = 'Success';
                httpBackend.expect('GET', url + '?foo=bar').respond(200, response);

                routes.requestMethodParamsData('GET', url, undefined, {foo: 'bar'}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('soll eine Url mit mehreren parametern ansprechen', function (done) {
                response = 'Success';
                httpBackend.expect('GET', url + '?foo=bar&coding=fun').respond(200, response);

                routes.requestMethodParamsData('GET', url, undefined, {foo: 'bar', coding: 'fun'}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });
        });

        describe('soll Daten an die Url schicken können', function () {
            it('soll einen Request ohne Daten abschicken', function (done) {
                response = 'Success';

                httpBackend.expect('GET', url, {}).respond(200, response);

                routes.requestMethodParamsData('GET', url, {}, undefined).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('soll einen Request mit Daten abschicken können', function (done) {
                var data = {
                    foo: 'bar',
                    coding: 'fun'
                };
                response = 'Success';

                httpBackend.expect('GET', url, data).respond(200, response);

                routes.requestMethodParamsData('GET', url, data, undefined).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });
        });

        it('soll die Urls zur Verfügung stellen', function () {
            expect(routes.urls).to.have.keys(['users', 'config', 'email', 'gruppen', 'jugenden', 'spiele', 'spielplan', 'team', 'ansprechpartner', 'anmeldung', 'veranstaltungen']);
            expect(routes.urls.email.base()).to.equal('/api/email');
            expect(routes.urls.users.resetPasswordCheck()).to.equal('/api/users/password-reset/check');
        });

        it('bei einer fehlerhaften Antwort, soll der Fehler bearbeitet werden', function (done) {
            var spy = chai.spy.on(mockErrorHandler, 'handleResponseError');

            httpBackend.expect('GET', url).respond(500, 'Error');

            routes.requestMethodParamsData('GET', url, undefined, undefined).then(function () {
                expect(spy).to.have.been.called.with('Error');
                return done();
            });
            httpBackend.flush();
        });

        it('bei einer ungültigen Method, soll ein Fehler geworfen werden', function (done) {
            routes.requestMethodParamsData('GET', url, undefined, undefined);
            httpBackend.verifyNoOutstandingRequest();
            done();
        });

        describe('soll Shorthand Methoden zur Verfügung stellen', function () {
            it('GET Shorthand', function (done) {
                response = 'Success';

                httpBackend.expect('GET', url).respond(200, response);

                routes.requestGET(url).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('GET by ID Shorthand', function (done) {
                response = 'Success';
                var id = 12;

                httpBackend.expect('GET', url + '?id=' + id).respond(200, response);

                routes.requestGETID(url, id).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('DELETE Shorthand', function (done) {
                response = 'Success';
                var id = 12;

                httpBackend.expect('DELETE', url + '?id=' + id).respond(200, response);

                routes.requestDELETE(url, id).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('PUT Shorthand', function (done) {
                response = 'Success';
                var data = {
                    data: 'abc',
                    name: 123
                };

                httpBackend.expect('PUT', url, data).respond(200, response);

                routes.requestPUT(url, data).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('PUT With ID Shorthand', function (done) {
                response = 'Success';
                var data = {
                    data: 'abc',
                    name: 123
                };
                var id = 12;

                httpBackend.expect('PUT', url + '?id=' + id, data).respond(200, response);

                routes.requestPUTID(url, id, data).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('POST Shorthand', function (done) {
                response = 'Success';
                var data = {
                    data: 'abc',
                    name: 123
                };

                httpBackend.expect('POST', url, data).respond(200, response);

                routes.requestPOST(url, data).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('Method Sorthand', function (done) {
                response = 'Success';

                httpBackend.expect('GET', url).respond(200, response);

                routes.requestMethod('GET', url).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('Method + Params Sorthand', function (done) {
                response = 'Success';
                var id = 12;

                httpBackend.expect('GET', url + '?id='+ id).respond(200, response);

                routes.requestMethodParams('GET', url, {id: id}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('Method + Data Sorthand', function (done) {
                response = 'Success';
                var data = {
                    foo: 'bar'
                };

                httpBackend.expect('GET', url, data).respond(200, response);

                routes.requestMethodData('GET', url, data).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('Method + Params + Data Sorthand', function (done) {
                response = 'Success';
                var id = 12;
                var data = {
                    foo: 'bar'
                };

                httpBackend.expect('GET', url + '?id='+ id, data).respond(200, response);

                routes.requestMethodParamsData('GET', url, data, {id: id}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('GET Base url shorthand', function (done) {
                response = 'Success';

                httpBackend.expect('GET', '/api/teams').respond(200, response);

                routes.requestGETBase('team').then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('GET Base url + Params shorthand', function (done) {
                response = 'Success';
                var id = 12;

                httpBackend.expect('GET', '/api/teams?id=' + id).respond(200, response);

                routes.requestGETBaseParam('team', {id: id}).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });
        });
    });
}());