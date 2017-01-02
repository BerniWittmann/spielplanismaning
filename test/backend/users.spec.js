var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Users', function () {
    before(function (done) {
        server.connectDB(function (err) {
            if (err) return done(err);
            done();
        });
    });

    var user = {
        username: 'test-user',
        password: '1337-5P34K',
        role: 'Bearbeiter'
    };

    it('soll einen Nutzer registrieren können', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken)
            .send(user)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
                mongoose.model('User').findOne({username: user.username}).exec(function (err, res) {
                    if (err) return done(err);
                    expect(res.username).to.be.equal(user.username);
                    expect(res.salt).to.exist;
                    expect(res.hash).to.exist;
                    return done();
                });

            });
    });

    it('soll einen Fehler zurückgeben bei fehlenden Feldern', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken)
            .send({username: 'test'})
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_FEHLENDE_FELDER');
                return done();
            });
    });

    it('soll keine doppelten Nutzernamen geben', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken)
            .send({username: 'test-user', password: 'neuesPW', role: 'Bearbeiter'})
            .expect(500)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(500);
                expect(res.body.MESSAGEKEY).to.equal('ERROR');
                expect(res.body.ERROR.code).to.equal(11000);
                return done();
            });
    });

    it('soll einen Nutzer einloggen können', function (done) {
        request(server)
            .post('/api/users/login')
            .send(user)
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.token).to.exist;
                return done();
            });
    });

    it('Bei Fehlenden Feldern soll eine Meldung zurückgegeben werden', function (done) {
        request(server)
            .post('/api/users/login')
            .send({})
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll einen Fehler liefern, bei falschem Passwort', function (done) {
        request(server)
            .post('/api/users/login')
            .send({username: 'test-user', password: 'bruteforce'})
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(401);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_FALSCHE_ANMELDEDATEN');
                return done();
            });
    });

    it('soll einen Fehler liefern, bei falschem Nutzernamen', function (done) {
        request(server)
            .post('/api/users/login')
            .send({username: 'test-user2', password: 'bruteforce'})
            .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(401);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_FALSCHE_ANMELDEDATEN');
                return done();
            });
    });

    it('wenn zum Löschen kein Nutzername angegeben ist, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken)
            .send({})
            .expect(400)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.be.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll einen Nutzer löschen können', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken)
            .send({username: 'test-user'})
            .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                mongoose.model('User').find({username: 'test-user'}).exec(function (err, res) {
                    if (err) return done(err);
                    expect(res).to.be.empty;
                    return done();
                });
            });
    });

    it('Bei falschem Nutzername soll ein Fehler geliefert werden', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken)
            .send({username: 'tippfehler'})
            .expect(404)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(404);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_USER_NOT_FOUND');
                expect(res.body.MESSAGE).to.equal('Benutzer tippfehler wurde nicht gefunden');
                return done();
            });
    });

    it('Der Nutzername berni soll nicht gelöscht werden können', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken)
            .send({username: 'berni'})
            .expect(403)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(403);
                expect(res.body.MESSAGEKEY).to.be.equal('ERROR_USER_NICHT_LOESCHBAR');
                return done();
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

