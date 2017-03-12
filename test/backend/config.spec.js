var expect = require('chai').expect;
var request = require("supertest");
var version = require('../../package.json').version;
var server = require('./testserver.js')();

describe('Route: Config', function () {

    it('Lädt die Configuration', function (done) {
        request(server).get('/api/config/').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.have.keys(['version', 'env', 'lockdown']);
            expect(response.body).to.deep.equal({
                version: version,
                env: 'testing',
                lockdown: true
            });
            return done();
        });
    });

    it('gibt die richtige Versionsnummer zurück', function (done) {
        request(server).get('/api/config/version').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal(version);
            return done();
        });
    });

    it('gibt den Lockdownmode zurück', function (done) {
        request(server).get('/api/config/lockdownmode').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal(true);
            return done();
        });
    });

    it('gibt die Umgebung zurück', function (done) {
        request(server).get('/api/config/env').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal('testing');
            return done();
        });
    });
});

