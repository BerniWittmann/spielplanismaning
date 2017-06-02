(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Spiel', function () {
        var mockLogger = {
            log: function () {
            }
        };

        beforeEach(module('spi.spiel'));
        beforeEach(module('spi.constants'));
        beforeEach(module('spi.logger'), function ($provide) {
            $provide.value('Logger', function () {
                return mockLogger;
            });
            $provide.value('errorHandler', mockErrorHandler)
        });
        var mockErrorHandler = {
            handleResponseError: function () {}
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });
        var ENDPOINT_BASE_URL = '/api/spiele';

        var httpBackend;
        var spiel;
        var response;
        var responseTest;
        var mockSpiele = [{
            nummer: '1',
            _id: '1',
            jugend: '123',
            gruppe: '1234'
        }, {
            nummer: '2',
            _id: '2',
            jugend: '123',
            gruppe: '1234'
        }, {
            nummer: '3',
            _id: '3',
            jugend: '312',
            gruppe: '3210'
        }, {
            nummer: '4',
            _id: '4',
            jugend: '321',
            gruppe: '4321'
        }];

        beforeEach(inject(function (_spiel_, $httpBackend) {
            httpBackend = $httpBackend;
            httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            spiel = _spiel_;
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

        it('soll alle Spiele laden', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = mockSpiele;
            httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            spiel.getAll().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll ein Spiel erstellen', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = mockSpiele[0];
            httpBackend.expectPOST(ENDPOINT_BASE_URL, mockSpiele[0]).respond(201, response);

            spiel.create(response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll ein bestimmtes Spiel laden', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = mockSpiele[0];
            httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            spiel.get('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll alle Spiele nach Jugend laden',inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = [mockSpiele[0], mockSpiele[1]];
            httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?jugend=123').respond(201, response);

            spiel.getByJugend('123').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
                expect(res).to.have.lengthOf(2);
            });
        }));

        it('soll alle Spiele nach Gruppe laden', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = [mockSpiele[0], mockSpiele[1]];
            httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?gruppe=1234').respond(201, response);

            spiel.getByGruppe('1234').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
                expect(res).to.have.lengthOf(2);
            });
        }));

        it('soll ein Spiel löschen können', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = 'Spiel gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            spiel.delete('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll alle Spiele löschen können', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = 'Alle Spiele gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '/alle').respond(201, response);

            spiel.deleteAll().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll die Tore eines Spiels updaten können', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = mockSpiele[0];
            response.toreA = 1;
            response.toreB = 4;
            var game = {
                nummer: '1',
                _id: '1',
                jugend: '123',
                gruppe: '1234',
                toreA: 1,
                toreB: 4
            };
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/tore?id=1', response).respond(201, response);

            spiel.updateTore(game).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll die Tore eines Spiels zurücksetzen', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            response = mockSpiele[0];
            response.toreA = 0;
            response.toreB = 0;
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '/tore?id=1').respond(201, response);

            spiel.resetSpiel(response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));

        it('soll die Reihenfolge der Spiele speichern', inject(function ($rootScope) {
            $rootScope.spielplanEnabled = true;
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '/order').respond(200, mockSpiele);

            spiel.updateOrder(mockSpiele).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        }));
    });
}());