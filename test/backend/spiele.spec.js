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

describe('Route: Spiele', function () {
    var spielid;
    var teamid;
    var gruppenid;
    var jugendid;
    var neuesSpielid;
    var alleSpiele;
    before(function (done) {
        databaseSetup.wipeAndCreate(function (err) {
            if (err) throw err;
            mongoose.model('Team').findOne('Team BA 1').exec(function (err, res) {
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
        return request(server)
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
        return request(server)
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
        return request(server)
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
        return request(server)
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
        return request(server)
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

    it('soll ein Spiel speichern können', function (done) {
        var spiel = {
            jugend: jugendid,
            gruppe: gruppenid
        };
        return request(server)
            .post('/api/spiele')
            .send(spiel)
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

    it('soll ein Spiel löschen können', function (done) {
        return request(server)
            .del('/api/spiele?id=' + neuesSpielid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.equal('success');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(9);
                    alleSpiele = res;
                    return done();
                });
            });
    });

    it('soll alle Spiele löschen können', function (done) {
        return request(server)
            .del('/api/spiele/alle')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.equal('success');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(0);
                    return done();
                });
            });
    });

    it('soll alle Spiele speichern können', function (done) {
        return request(server)
            .post('/api/spiele/alle')
            .send(alleSpiele)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.equal('Spielplan erstellt');
                mongoose.model('Spiel').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(9);
                    return done();
                });
            });
    });

    it('soll die Tore zurücksetzen können', function (done) {
        return request(server)
            .del('/api/spiele/tore?id=' + spielid)
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
        return request(server)
            .put('/api/spiele/tore?id=' + spielid)
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
        databaseSetup.disconnect(done);
    });
});



