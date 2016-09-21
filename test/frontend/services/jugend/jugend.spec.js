(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Jugend', function () {
        beforeEach(module('spi.jugend'));
        var ENDPOINT_BASE_URL = '/api/jugenden';

        var httpBackend;
        var jugend;
        var response;
        var responseTest;
        var mockJugenden = [{
            name: 'Jugend 1',
            _id: '1',
            gruppen: ['567']
        }, {
            name: 'Jugend 2',
            _id: '2',
            gruppen: ['234']
        }, {
            name: 'Jugend 3',
            _id: '3',
            gruppen: ['312', '123']
        }];

        beforeEach(inject(function (_jugend_, $httpBackend) {
            jugend = _jugend_;
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

        it('soll alle Jugenden laden', function () {
            response = mockJugenden;
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            jugend.getAll().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll eine bestimmte Jugend laden', function () {
            response = mockJugenden[0];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            jugend.get('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll eine Jugend erstellen', function () {
            response = mockJugenden[0];
            httpBackend.expectPOST(ENDPOINT_BASE_URL, mockJugenden[0]).respond(201, response);

            jugend.create(response).then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll eine Jugend löschen können', function () {
            response = 'Jugend gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            jugend.delete('1').then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll eine Jugend updaten können', function () {
            response = mockJugenden[0];
            response.name = 'Neuer Name';
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            jugend.update('1', {name: 'Neuer Name', _id: '1', gruppen: ['567']}).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll einer Jugend eine Gruppe hinzufügen können', function () {
            response = mockJugenden[0];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);
            response.gruppen.push('abc');
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            jugend.addGruppe('1', 'abc').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll die Tore für eine bestimmte Jugend laden', function () {
            response = 21;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/tore?id=1').respond(201, response);

            jugend.getTore('1').then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            })
        });

        it('soll die Tore für alle Jugend laden', function () {
            response = 213;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/tore').respond(201, response);

            jugend.getGesamtTore().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            })
        });
    });

}());