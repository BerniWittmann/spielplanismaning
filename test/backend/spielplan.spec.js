var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();
var mongoose = require('mongoose');
const constants = require('../../src/config/constants');
const cls = require('../../src/config/cls');

describe('Route: Spielplan', function () {
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            done();
        });
    });

    it('soll den Spielplan laden können', function (done) {
        request(server)
            .get('/api/spielplan/')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.startzeit).to.be.equal('09:00');
                expect(response.body.spielzeit).to.be.a('Number');
                expect(response.body.pausenzeit).to.be.a('Number');
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
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
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
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
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
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
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

    it('wenn die Startzeit vor der Endzeit liegt, soll ein Fehler geworfen werden', function (done) {
        var spielplan = {
            startzeit: '19:00',
            spielzeit: 6,
            pausenzeit: 4,
            endzeit: '10:00',
            startdatum: '01.01.1970',
            enddatum: '01.01.1970'
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_ZEITEN_UNGUELTIG');
                return done();
            });
    });

    it('wenn das Startdatum nach dem Enddatum liegt, soll ein Fehler geworfen werden', function (done) {
        var spielplan = {
            startzeit: '10:00',
            spielzeit: 6,
            pausenzeit: 4,
            endzeit: '19:00',
            startdatum: '31.12.2000',
            enddatum: '01.01.1970'
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_ZEITEN_UNGUELTIG');
                return done();
            });
    });

    it('soll die Zeiten updaten können', function (done) {
        var spielplan = {
            startzeit: '10:00',
            spielzeit: 6,
            pausenzeit: 4,
            endzeit: '19:00',
            startdatum: '01.01.1970',
            enddatum: '01.01.1970'
        };
        request(server)
            .put('/api/spielplan/zeiten')
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .send(spielplan)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Spielplan').findOne().exec(function (err, res) {
                        if (err) throw err;
                        expect(res.startzeit).to.be.equal(spielplan.startzeit);
                        expect(res.spielzeit).to.be.equal(spielplan.spielzeit);
                        expect(res.pausenzeit).to.be.equal(spielplan.pausenzeit);
                        return done();
                    });
                });
            });
    });

    it('soll den Spielplan generieren', function (done) {
        request(server)
            .put('/api/spielplan')
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SPIELPLAN_CREATED_MESSAGE');
                expect(response.body.STATUSCODE).to.equal(200);
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Spiel').find().exec(function (err, res) {
                        if (err) throw err;
                        expect(res).to.have.lengthOf(15);
                        return done();
                    });
                });
            });
    });

    it('soll den Spielplan mit Erhalt von Spielen regenerieren', function (done) {
        request(server)
            .put('/api/spielplan')
            .send({keep: true})
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SPIELPLAN_CREATED_MESSAGE');
                expect(response.body.STATUSCODE).to.equal(200);
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Spiel').find().exec(function (err, res) {
                        if (err) throw err;
                        expect(res).to.have.lengthOf(15);
                        return done();
                    });
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

