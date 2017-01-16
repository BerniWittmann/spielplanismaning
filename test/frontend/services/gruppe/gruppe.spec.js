(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Gruppe', function () {
        beforeEach(module('spi.gruppe'));
        var ENDPOINT_BASE_URL = '/api/gruppen';

        var httpBackend;
        var gruppe;
        var response;
        var responseTest;
        var mockGruppen = [{
            name: 'Gruppe 1',
            _id: '1',
            jugend: '123'
        }, {
            name: 'Gruppe 2',
            _id: '2',
            jugend: '123'
        }, {
            name: 'Gruppe 3',
            _id: '3',
            jugend: '312'
        }, {
            name: 'Gruppe 4',
            _id: '4',
            jugend: '321'
        }];

        var mockErrorHandler = {
            handleResponseError: function () {}
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(inject(function (_gruppe_, $httpBackend) {
            gruppe = _gruppe_;
            httpBackend = $httpBackend;
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

        it('soll alle Gruppen laden', function () {
            response = mockGruppen;
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            gruppe.getAll().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll eine Gruppe erstellen', function () {
            response = mockGruppen[0];
            httpBackend.expectPOST(ENDPOINT_BASE_URL + '?jugend=123', mockGruppen[0]).respond(201, response);

            gruppe.create(response.jugend, response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll eine bestimmte Gruppe laden', function () {
            response = mockGruppen[0];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            gruppe.get('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll alle Gruppen nach Jugend laden', function () {
            response = [mockGruppen[0], mockGruppen[1]];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?jugend=123').respond(201, response);

            gruppe.getByJugend('123').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll eine Gruppe löschen können', function () {
            response = 'Gruppe gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            gruppe.delete('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });
    });

}());