(function () {
    'use strict';

    var expect = chai.expect;

    describe('Service: Config', function () {
        beforeEach(module('ui.router'));
        beforeEach(module('spi.config'));
        var ENDPOINT_BASE_URL = '/api/config';

        var httpBackend;
        var response;
        var responseTest;
        var configData = {
            env: 'testing',
            version: '1.0.0',
            lockdown: true
        };
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
                expect(_.isEqual(responseTest, response)).to.equal(true);
            }
        });

        it('soll die Config laden', function () {
            response = configData;
            httpBackend.expectGET(ENDPOINT_BASE_URL).respond(201, response);

            config.getConfig().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll die Env-Variable laden', function () {
            response = configData.env;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/env').respond(201, response);

            config.getEnv().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll die Version laden', function () {
            response = configData.version;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/version').respond(201, response);

            config.getVersion().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });

        it('soll den LockdownMode laden', function () {
            response = configData.lockdown;
            httpBackend.expectGET(ENDPOINT_BASE_URL + '/lockdownmode').respond(201, response);

            config.getLockdown().then(function (res) {
                responseTest = res;
                expect(_.isEqual(res, response)).to.be.true;
            });
        });
    });
}());