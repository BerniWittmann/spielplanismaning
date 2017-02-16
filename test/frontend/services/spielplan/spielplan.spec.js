(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Spielplan', function () {
        var mockLogger = {
            log: function () {
            }
        };
        var mockAuth = {
            getToken: function () {
                return 'TEST';
            }
        };
        var mockState = {
            go: function () {
            }
        };
        var mockErrorHandler = {
            handleResponseError: function () {}
        };
        beforeEach(module('spi.spielplan'));

        var ENDPOINT_BASE_URL = '/api/spielplan';

        var httpBackend;
        var spielplan;
        var response;
        var responseTest;
        beforeEach(function () {
            module(function ($provide) {
                $provide.value('$state', mockState);
                $provide.value('auth', mockAuth);
                $provide.value('Logger', mockLogger);
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(inject(function (_spielplan_, $httpBackend) {
            spielplan = _spielplan_;
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

        it('Die Zeiten werden geladen', function () {
            response = {
                startzeit: '09:00',
                spielzeit: 8,
                pausenzeit: 2
            };
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            spielplan.getZeiten().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('Die Zeiten werden gespeichert', function () {
            response = {
                startzeit: '09:00',
                spielzeit: 8,
                pausenzeit: 2
            };
            httpBackend.expectPUT(ENDPOINT_BASE_URL + '/zeiten').respond(201, response);

            spielplan.saveZeiten(response).then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });
    });
}());