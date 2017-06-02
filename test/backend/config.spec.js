var expect = require('chai').expect;
var request = require("supertest");
var version = require('../../package.json').version;
var server = require('./testserver.js')();
var constants = require('../../src/config/constants');

describe('Route: Config', function () {
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            return done();
        });
    });
    it('Lädt die Configuration', function (done) {
        request(server)
            .get('/api/config/')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.keys(['version', 'env', 'lockdown', 'plaetze', 'spielmodus', 'mannschaftslisten', 'spielplanEnabled']);
                expect(response.body).to.deep.equal({
                    version: version,
                    env: 'testing',
                    lockdown: true,
                    plaetze: '3',
                    spielmodus: 'normal',
                    mannschaftslisten: true,
                    spielplanEnabled: true
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

    it('gibt die Anzahl PLätze zurück', function (done) {
        request(server).get('/api/config/plaetze').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal('3');
            return done();
        });
    });

    it('gibt den Spielmodus zurück', function (done) {
        request(server)
            .get('/api/config/spielmodus')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal('normal');
            return done();
        });
    });

    it('gibt den Mannschaftslisten Druck zurück', function (done) {
        request(server)
            .get('/api/config/mannschaftslisten')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.true;
                return done();
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

