var expect = require('chai').expect;
var request = require("supertest");
var env = {
    ENVIRONMENT: 'TESTING',
    LOCKDOWNMODE: 'true'
};
var version = require('../../package.json').version;
var server = require('./testserver.js')(env);

describe('Route: Config', function () {

    it('gibt die richtige Versionsnummer zurück', function (done) {
        return request(server).get('/api/config/version').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal(version);
            return done();
        });
    });

    it('gibt den Lockdownmode zurück', function (done) {
        return request(server).get('/api/config/lockdownmode').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal(true);
            return done();
        });
    });

    it('gibt die Umgebung zurück', function (done) {
        return request(server).get('/api/config/env').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body).to.equal('TESTING');
            return done();
        });
    });

    it('gibt die Kontaktangaben zurück', function (done) {
        return request(server).get('/api/config/kontakt').end(function (err, response) {
            if (err) return done(err);
            expect(response).not.to.be.undefined;
            expect(response.statusCode).to.equal(200);
            expect(response.body[0].name).to.equal('Klaus Krecken');
            expect(response.body[1].name).to.equal('Stefan Meyer');
            return done();
        });
    });
});

