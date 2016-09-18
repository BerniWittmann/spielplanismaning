(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Config', function () {
        beforeEach(module('spi.config'));
        var ENDPOINT_BASE_URL = '/api/config';

        var httpBackend;
        var response;
        var responseTest;
        var env = 'TESTING';
        var version = '1.0.0';
        var kontakte = [{name: 'Name', email: 'Test@test.de', turnier: 'Test-Turnier'}];
        var config;

        beforeEach(inject(function (_config_, $httpBackend) {
            config = _config_;
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

        it('soll die Env-Variable laden', function () {
            response = env;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/env').respond(201, response);

            config.getEnv().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll die Version laden', function () {
            response = version;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/version').respond(201, response);

            config.getVersion().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });

        it('soll die Kontakte laden', function () {
            response = env;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/kontakt').respond(201, response);

            config.getKontakte().then(function (res) {
                responseTest = res.data;
                expect(_.isEqual(res.data, response)).to.be.true;
            });
        });
    });
}());