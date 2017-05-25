var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();
var mongoose = require('mongoose');
const constants = require('../../src/config/constants');
const cls = require('../../src/config/cls');

describe('Route: Teams', function () {
    var jugendid;
    var gruppeid;
    var teamid;
    var neuesTeamid;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            jugendid = server.IDs.jugend;
            gruppeid = server.IDs.gruppen[0];
            done();
        });
    });

    it('soll alle Teams laden können', function (done) {
        request(server)
            .get('/api/teams/')
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(6);
                teamid = response.body[0]._id;
                return done();
            });
    });

    it('soll ein einzelnes Team laden können', function (done) {
        request(server)
            .get('/api/teams?id=' + teamid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.be.equal(teamid);
                expect(response.body.name).to.be.equal('Team 1');
                return done();
            });
    });

    it('soll die Teams einer Jugend laden können', function (done) {
        request(server)
            .get('/api/teams?jugend=' + jugendid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(6);
                expect(response.body[0].jugend._id.toString()).to.be.equal(jugendid.toString());
                return done();
            });
    });

    it('soll die Teams einer Gruppe laden können', function (done) {
        request(server)
            .get('/api/teams?gruppe=' + gruppeid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(3);
                expect(response.body[0].gruppe._id.toString()).to.be.equal(gruppeid.toString());
                return done();
            });
    });

    it('wenn beim Hinzufügen kein Name angegeben wird, soll ein Fehler geworfen werden', function (done) {
        var neuesTeam = {};
        request(server)
            .post('/api/teams?jugend=' + jugendid + '&gruppe=' + gruppeid)
            .send(neuesTeam)
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

    it('soll ein Team hinzufügen können', function (done) {
        var neuesTeam = {
            name: 'FC Bayern München'
        };
        request(server)
            .post('/api/teams?jugend=' + jugendid + '&gruppe=' + gruppeid)
            .send(neuesTeam)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.name).to.be.equal(neuesTeam.name);
                neuesTeamid = response.body._id;
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Gruppe').findById(gruppeid).exec(function (err, res) {
                        if (err) throw err;
                        expect(res.teams).to.have.lengthOf(4);
                        expect(res.teams).to.contain(neuesTeamid.toString());
                        return done();
                    });
                });
            });
    });

    it('wenn bei der Aktualisierung keine ID angegeben wird, soll ein Fehler geworfen werden', function (done) {
        var reqbody = {
            name: 'Neuer Name'
        };
        request(server)
            .put('/api/teams?id=')
            .send(reqbody)
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

    it('soll den Namen eines Teams aktualisieren können', function (done) {
        var reqbody = {
            name: 'Neuer Name'
        };
        request(server)
            .put('/api/teams?id=' + neuesTeamid)
            .send(reqbody)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.name).to.be.equal(reqbody.name);
                expect(response.body._id).to.be.equal(neuesTeamid.toString());
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Team').findById(neuesTeamid).exec(function (err, res) {
                        if (err) throw err;
                        expect(res.name).to.be.equal(reqbody.name);
                        return done();
                    });
                });
            });
    });

    it('wenn beim Löschen keine ID angegeben wird, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .del('/api/teams?id=')
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

    it('soll ein Team löschen', function (done) {
        request(server)
            .del('/api/teams?id=' + neuesTeamid)
            .set(constants.BEACH_EVENT_HEADER_NAME, server.eventID)
            .set('Authorization', server.adminToken())
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                const clsSession = cls.getNamespace();
                return clsSession.run(function () {
                    clsSession.set('beachEventID', server.eventID);
                    mongoose.model('Team').find().exec(function (err, res) {
                        if (err) throw err;
                        expect(res).to.have.lengthOf(6);
                        const clsSession = cls.getNamespace();
                        return clsSession.run(function () {
                            clsSession.set('beachEventID', server.eventID);
                            mongoose.model('Gruppe').findById(gruppeid).exec(function (err, res) {
                                if (err) throw err;
                                expect(res.teams).to.have.lengthOf(3);
                                expect(res.teams).not.to.contain(neuesTeamid.toString());
                                return done();
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



