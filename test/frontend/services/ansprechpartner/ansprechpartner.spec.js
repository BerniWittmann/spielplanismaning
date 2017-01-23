(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Ansprechpartner', function () {
        beforeEach(module('spi.ansprechpartner'));
        var ENDPOINT_BASE_URL = '/api/ansprechpartner';

        var httpBackend;
        var ansprechpartner;
        var response;
        var responseTest;
        var mockAnsprechpartner = [{
            name: 'Ansprechpartner 1',
            _id: '1',
            turnier: 'Turnier 1',
            email: 'a1@test.de'
        }, {
            name: 'Ansprechpartner 2',
            _id: '2',
            turnier: 'Turnier 2',
            email: 'a2@test.de'
        }, {
            name: 'Ansprechpartner 3',
            _id: '3',
            turnier: 'Turnier 3',
            email: 'a3@test.de'
        }, {
            name: 'Ansprechpartner 4',
            _id: '4',
            turnier: 'Turnier 4',
            email: 'a4@test.de'
        }];

        var mockErrorHandler = {
            handleResponseError: function () {}
        };

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(inject(function (_ansprechpartner_, $httpBackend) {
            ansprechpartner = _ansprechpartner_;
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

        it('soll alle Ansprechpartner laden', function () {
            response = mockAnsprechpartner;
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            ansprechpartner.getAll().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll einen Ansprechpartner erstellen', function () {
            response = mockAnsprechpartner[0];
            httpBackend.expectPOST(ENDPOINT_BASE_URL, mockAnsprechpartner[0]).respond(201, response);

            ansprechpartner.create(response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll einen bestimmten Ansprechpartner laden', function () {
            response = mockAnsprechpartner[0];
            httpBackend.expectGET(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            ansprechpartner.get('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll einen Ansprechpartner aktualisieren können', function () {
            response = mockAnsprechpartner[0];
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '?id=1', mockAnsprechpartner[0]).respond(201, response);

            ansprechpartner.update('1', response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll einen Ansprechpartner löschen können', function () {
            response = 'Ansprechpartner gelöscht';
            httpBackend.expectDELETE(ENDPOINT_BASE_URL + '?id=1').respond(201, response);

            ansprechpartner.delete('1').then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });
    });

}());