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
    });
}());