var expect = require('chai').expect;
var request = require("request");
var url = 'http://localhost:8001';
var env = {
    ENVIRONMENT: 'TESTING',
    LOCKDOWNMODE: 'true'
};
var version = require('../../package.json').version;
var server = require('./testserver.js')(env);

before(function (done) {
    return server.start(done);
});

describe('Route: config', function () {

    it('gibt die richtige Versionsnummer zurück', function (done) {
        return request(url + '/config/version', function (error, response, body) {
            if (error) {
                expect(error).to.be.undefined;
                expect(error.code).not.to.be.equal('ECONNREFUSED');
            }

            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('"'+version+'"');

            done();
        });
    });

    it('gibt den Lockdownmode zurück', function (done) {
        return request(url + '/config/lockdownmode', function (error, response, body) {
            if (error) {
                expect(error).to.be.undefined;
                expect(error.code).not.to.be.equal('ECONNREFUSED');
            }

            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('true');

            done();
        });
    });

    it('gibt die Umgebung zurück', function (done) {
        return request(url + '/config/env', function (error, response, body) {
            if (error) {
                expect(error).to.be.undefined;
                expect(error.code).not.to.be.equal('ECONNREFUSED');
            }

            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('"TESTING"');

            done();
        });
    })
});

after(function (done) {
    return server.quit(done);
});