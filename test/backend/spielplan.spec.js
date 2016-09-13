var expect = require('chai').expect;
var request = require("supertest");
var env = {
    ENVIRONMENT: 'TESTING',
    LOCKDOWNMODE: 'false',
    MONGO_DB_URI: 'mongodb://localhost/spielplan-test'
};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');
var databaseSetup = require('./database-setup/database-setup')(env.MONGO_DB_URI);

describe('Route: Spielplan', function () {
    var ausnahme;
    var ausnahmenVorher;
    before(function (done) {
        databaseSetup.wipeAndCreate(function (err) {
            if (err) throw err;
            done();
        });
    });

    it('soll den Spielplan laden können', function (done) {
        return request(server)
            .get('/api/spielplan/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.startzeit).to.be.equal('09:00');
                expect(response.body.spielzeit).to.be.a('Number');
                expect(response.body.pausenzeit).to.be.a('Number');
                expect(response.body.ausnahmen).to.be.a('Array');
                expect(response.body.ausnahmen).not.to.be.empty;
                ausnahme = response.body.ausnahmen[0];
                ausnahmenVorher = response.body.ausnahmen.length;
                return done();
            });
    });

    it('soll die Zeiten updaten können', function (done) {
        var spielplan = {
            startzeit: '10:00',
            spielzeit: 6,
            pausenzeit: 4
        };
        return request(server)
            .put('/api/spielplan/zeiten')
            .send(spielplan)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.equal('Spielplan erstellt');
                mongoose.model('Spielplan').findOne().exec(function (err, res) {
                    if (err) throw err;
                    expect(res.startzeit).to.be.equal(spielplan.startzeit);
                    expect(res.spielzeit).to.be.equal(spielplan.spielzeit);
                    expect(res.pausenzeit).to.be.equal(spielplan.pausenzeit);
                    return done();
                });
            });
    });

    it('soll die Ausnahmen speichern', function (done) {
        return request(server)
            .put('/api/spielplan/ausnahmen')
            .send(ausnahme)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body[0]._id).to.exist;
                mongoose.model('Spielplan').findOne().exec(function (err, res) {
                    if (err) throw err;
                    expect(res.ausnahmen).to.have.lengthOf(1);
                    return done();
                });
            });
    });

    it('soll die Ausnahmen laden', function (done) {
        return request(server)
            .get('/api/spielplan/ausnahmen')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(1);
                expect(response.body[0]._id).to.be.equal(ausnahme._id);
                return done();
            });
    });

    after(function (done) {
        databaseSetup.disconnect(done);
    });
});

