var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();
var mongoose = require('mongoose');

describe('Route: Spielplan', function () {
    var ausnahme;
    var ausnahmenVorher;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            done();
        });
    });

    it('soll den Spielplan laden können', function (done) {
        request(server)
            .get('/api/spielplan/')
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

    it('wenn keine Startzeit angegeben wird, soll ein Fehler geworfen werden', function (done) {
        var spielplan = {
            spielzeit: 6,
            pausenzeit: 4
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('wenn keine Spielzeit angegeben wird, soll ein Fehler geworfen werden', function (done) {
        var spielplan = {
            startzeit: '10:00',
            pausenzeit: 4
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('wenn keine Pausenzeit angegeben wird, soll ein Fehler geworfen werden', function (done) {
        var spielplan = {
            startzeit: '10:00',
            spielzeit: 6
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll die Zeiten updaten können', function (done) {
        var spielplan = {
            startzeit: '10:00',
            spielzeit: 6,
            pausenzeit: 4
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
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
        request(server)
            .put('/api/spielplan/ausnahmen')
            .send(ausnahme)
            .set('Authorization', server.adminToken)
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
        request(server)
            .get('/api/spielplan/ausnahmen')
            .set('Authorization', server.adminToken)
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

    it('soll den Spielplan generieren', function (done) {
        request(server)
            .put('/api/spielplan')
            .set('Authorization', server.adminToken)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SPIELPLAN_CREATED_MESSAGE');
                expect(response.body.STATUSCODE).to.equal(200);
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(9);
                    return done();
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

