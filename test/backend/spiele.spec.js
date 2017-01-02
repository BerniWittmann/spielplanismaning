var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Spiele', function () {
    var spielid;
    var teamid;
    var gruppenid;
    var jugendid;
    var neuesSpielid;
    var alleSpiele;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            mongoose.model('Team').findOne({'name': 'Team BA 1'}).exec(function (err, res) {
                if (err) throw err;
                expect(res).not.to.be.null;
                teamid = res._id;
                gruppenid = res.gruppe;
                jugendid = res.jugend;
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    spielid = res[0]._id;
                });
                done();
            });
        });
    });

    it('soll alle Spiele laden können', function (done) {
        request(server)
            .get('/api/spiele/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(9);
                return done();
            });
    });

    it('soll ein einzelnes Spiel laden können', function (done) {
        request(server)
            .get('/api/spiele?id=' + spielid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Object');
                expect(response.body.nummer).to.be.a('number');
                expect([1, 2, 3]).to.contain(response.body.platz);
                expect(response.body._id.toString()).to.be.equal(spielid.toString());
                return done();
            });
    });

    it('soll die Spiele einer Gruppe laden', function (done) {
        request(server)
            .get('/api/spiele?gruppe=' + gruppenid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Array');
                expect(response.body).to.have.lengthOf(1);
                expect(response.body[0].gruppe._id.toString()).to.be.equal(gruppenid.toString());
                return done();
            });
    });

    it('soll die Spiele einer Jugend laden', function (done) {
        request(server)
            .get('/api/spiele?jugend=' + jugendid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Array');
                expect(response.body).to.have.lengthOf(4);
                expect(response.body[0].jugend._id.toString()).to.be.equal(jugendid.toString());
                return done();
            });
    });

    it('soll die Spiele eines Teams laden', function (done) {
        request(server)
            .get('/api/spiele?team=' + teamid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Array');
                expect(response.body).to.have.lengthOf(1);
                //das geladene Team soll entweder Team A oder Team B sein
                expect([response.body[0].teamA._id.toString(), response.body[0].teamB._id.toString()]).to.contain(teamid.toString());
                return done();
            });
    });

    it('wenn die Gruppe ungültig ist, soll ein Fehler geworfen werden', function (done) {
        var spiel = {
            jugend: jugendid
        };
        request(server)
            .post('/api/spiele')
            .send(spiel)
            .set('Authorization', server.adminToken)
            .expect(400)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('wenn die Jugend ungültig ist, soll ein Fehler geworfen werden', function (done) {
        var spiel = {
            gruppe: gruppenid
        };
        request(server)
            .post('/api/spiele')
            .send(spiel)
            .set('Authorization', server.adminToken)
            .expect(400)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll ein Spiel speichern können', function (done) {
        var spiel = {
            jugend: jugendid,
            gruppe: gruppenid
        };
        request(server)
            .post('/api/spiele')
            .send(spiel)
            .set('Authorization', server.adminToken)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.exist;
                neuesSpielid = response.body._id;
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(10);
                    return done();
                });
            });
    });

    it('wenn keine Spielid zum Löschen gesendet wird, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .del('/api/spiele?id=')
            .set('Authorization', server.adminToken)
            .expect(400)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll ein Spiel löschen können', function (done) {
        request(server)
            .del('/api/spiele?id=' + neuesSpielid)
            .set('Authorization', server.adminToken)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(9);
                    alleSpiele = res;
                    return done();
                });
            });
    });

    it('soll alle Spiele löschen können', function (done) {
        request(server)
            .del('/api/spiele/alle')
            .set('Authorization', server.adminToken)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(0);
                    return done();
                });
            });
    });

    it('soll alle Spiele speichern können', function (done) {
        request(server)
            .put('/api/spiele/alle')
            .set('Authorization', server.adminToken)
            .send(alleSpiele)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('SPIELPLAN_CREATED_MESSAGE');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(9);
                    return done();
                });
            });
    });

    it('wenn keine Spielid zum Zurücksetzen gesendet wird, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .del('/api/spiele/tore?id=')
            .set('Authorization', server.adminToken)
            .expect(400)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll die Tore zurücksetzen können', function (done) {
        request(server)
            .del('/api/spiele/tore?id=' + spielid)
            .set('Authorization', server.adminToken)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.toreA).to.equal(0);
                expect(response.body.toreB).to.equal(0);
                expect(response.body.punkteA).to.equal(0);
                expect(response.body.punkteB).to.equal(0);
                expect(response.body.beendet).to.equal(false);
                mongoose.model('Spiel').findById(spielid).exec(function (err, res) {
                    if (err) throw err;
                    expect(res.toreA).to.equal(0);
                    expect(res.toreB).to.equal(0);
                    expect(res.punkteA).to.equal(0);
                    expect(res.punkteB).to.equal(0);
                    expect(res.beendet).to.equal(false);
                    return done();
                });
            });
    });

    it('soll das Ergebnis speichern', function (done) {
        request(server)
            .put('/api/spiele/tore?id=' + spielid)
            .set('Authorization', server.adminToken)
            .send({toreA: 5, toreB: 8})
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.toreA).to.equal(5);
                expect(response.body.toreB).to.equal(8);
                expect(response.body.punkteA).to.equal(0);
                expect(response.body.punkteB).to.equal(2);
                expect(response.body.beendet).to.equal(true);
                return done();
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});



