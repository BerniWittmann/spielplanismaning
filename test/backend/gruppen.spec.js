var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();
var mongoose = require('mongoose');
const constants = require('../../src/config/constants');
const cls = require('../../src/config/cls');

describe('Route: Gruppen', function () {
    var jugendid;
    var anzahlVorher = 2;
    var gruppeid;
    var neueGruppeId;
    var neueGruppeJugend;
    var anzahlTeamsGruppe = 3;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            jugendid = server.IDs.jugend;
            gruppeid = server.IDs.gruppen[0];
            return done();
        });
    });

    it('soll alle Gruppen laden können', function (done) {
        request(server)
            .get('/api/gruppen/')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].name).to.be.equal('Gruppe A');
                expect(response.body[1].name).to.be.equal('Gruppe B');
                return done();
            });
    });

    it('soll eine einzelne Gruppe laden können', function (done) {
        request(server)
            .get('/api/gruppen?id=' + gruppeid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Object');
                expect(response.body._id).to.be.equal(gruppeid);
                expect(response.body.name).to.be.equal('Gruppe A');
                expect(response.body.jugend.name).to.be.equal('Jugend');
                anzahlTeamsGruppe = response.body.teams.length;
                return done();
            });
    });

    it('soll die Gruppen einer Jugend laden können', function (done) {
        request(server)
            .get('/api/gruppen?jugend=' + jugendid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].name).to.be.equal('Gruppe A');
                expect(response.body[1].name).to.be.equal('Gruppe B');
                expect(response.body[0].jugend._id.toString()).to.be.equal(jugendid.toString());
                expect(response.body[1].jugend._id.toString()).to.be.equal(jugendid.toString());
                expect(response.body[0].jugend.name).to.be.equal('Jugend');
                expect(response.body[1].jugend.name).to.be.equal('Jugend');
                anzahlVorher = response.body.length;
                return done();
            });
    });

    it('Bei einem leeren Gruppenname soll ein Fehler geworfen werden', function (done) {
        var gruppe = {};
        request(server)
            .post('/api/gruppen?jugend=' + jugendid.toString())
            .send(gruppe)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('Bei einer nicht vorhandenen Jugend soll ein Fehler geworfen werden', function (done) {
        var gruppe = {
            name: 'Ich hab keine Jugend'
        };
        request(server)
            .post('/api/gruppen?jugend=' + undefined)
            .send(gruppe)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll eine Gruppe hinzufügen können', function (done) {
        var gruppe = {
            name: 'Neue Gruppe'
        };
        request(server)
            .post('/api/gruppen?jugend=' + jugendid.toString())
            .send(gruppe)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.exist;
                expect(response.body.name).to.be.equal(gruppe.name);
                expect(response.body.jugend).to.be.equal(jugendid.toString());
                neueGruppeId = response.body._id;
                neueGruppeJugend = response.body.jugend;
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Gruppe').find({jugend: jugendid.toString()}).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).to.have.lengthOf(anzahlVorher + 1);
                        return done();
                    });
                });
            });
    });

    it('wenn die Gruppenid zum löschen fehlt, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .del('/api/gruppen?id=')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .end(function (err, res) {
                if (err) throw err;
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('wenn die Gruppenid zum löschen falsch ist, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .del('/api/gruppen?id=' + 'aaaa1111bbbb2222cccc3333')
            .set('Authorization', server.adminToken())
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .end(function (err, res) {
                if (err) throw err;
                expect(res).not.to.be.unfined;
                expect(res.statusCode).to.equal(404);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_GROUP_NOT_FOUND');
                return done();
            });
    });

    it('soll eine Gruppe löschen können und die Teams mitlöschen', function (done) {
        request(server)
            .post('/api/teams?jugend=' + neueGruppeJugend + '&gruppe=' + neueGruppeId)
            .send({name: 'Test Team'})
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .end(function (err) {
                if (err) throw err;
                var anzahlTeamsVorher;

                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Team').find().exec(function (err, res) {
                        if (err) throw err;
                        anzahlTeamsVorher = res.length;
                        return request(server)
                            .del('/api/gruppen?id=' + neueGruppeId)
                            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
                            .set('Authorization', server.adminToken())
                            .expect(200)
                            .end(function (err, res) {
                                if (err) throw err;
                                expect(res.body.MESSAGEKEY).to.equal('SUCCESS_DELETE_MESSAGE');
                                const clsSession = cls.getNamespace();
                                return clsSession.run(function () {
                                    clsSession.set('beachEventID', server.eventID);
                                    mongoose.model('Gruppe').findById(neueGruppeId).exec(function (err, res) {
                                        if (err) throw err;
                                        expect(res).not.to.exist;
                                        const clsSession = cls.getNamespace();
                                        return clsSession.run(function () {
                                            clsSession.set('beachEventID', server.eventID);
                                            mongoose.model('Team').find().exec(function (err, res) {
                                                if (err) throw err;
                                                expect(res.length).to.be.equal(anzahlTeamsVorher - 1);
                                                done();
                                            });
                                        });
                                    });
                                });
                            });
                    });
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});



