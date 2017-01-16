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

                    routes.request({
                        method: method,
                        url: url
                    }).then(function (res) {
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

                routes.request({
                    method: 'GET',
                    url: url,
                    params: {}
                }).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('soll eine Url mit einem parameter ansprechen', function (done) {
                response = 'Success';
                httpBackend.expect('GET', url + '?foo=bar').respond(200, response);

                routes.request({
                    method: 'GET',
                    url: url,
                    params: {
                        foo: 'bar'
                    }
                }).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });

            it('soll eine Url mit mehreren parametern ansprechen', function (done) {
                response = 'Success';
                httpBackend.expect('GET', url + '?foo=bar&coding=fun').respond(200, response);

                routes.request({
                    method: 'GET',
                    url: url,
                    params: {
                        foo: 'bar',
                        coding: 'fun'
                    }
                }).then(function (res) {
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

                routes.request({
                    method: 'GET',
                    url: url,
                    data: {}
                }).then(function (res) {
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

                routes.request({
                    method: 'GET',
                    url: url,
                    data: data
                }).then(function (res) {
                    responseTest = res;
                    expect(_.isEqual(res, response)).to.be.true;
                    return done();
                });
                httpBackend.flush();
            });
        });

        it('soll die Urls zur Verfügung stellen', function () {
            expect(routes.urls).to.have.all.keys(['users', 'config', 'email', 'gruppen', 'jugenden', 'spiele', 'spielplan', 'team']);
            expect(routes.urls.email.base()).to.equal('/api/email');
            expect(routes.urls.users.resetPasswordCheck()).to.equal('/api/users/password-reset/check');
        });

        it('bei einer fehlerhaften Antwort, soll der Fehler bearbeitet werden', function (done) {
            var spy = chai.spy.on(mockErrorHandler, 'handleResponseError');

            httpBackend.expect('GET', url).respond(500, 'Error');

            routes.request({
                method: 'GET',
                url: url
            }).then(function () {
                expect(spy).to.have.been.called.with('Error');
                return done();
            });
            httpBackend.flush();
        });
    });
}());