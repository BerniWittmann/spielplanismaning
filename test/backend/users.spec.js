var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Users', function () {
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            done();
        });
    });

    var user = {
        username: 'test-user',
        password: '1337-5P34K',
        role: 'Bearbeiter'
    };

    it('soll einen Nutzer registrieren können', function (done) {
        return request(server)
            .post('/api/users/register')
            .send(user)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.message).to.equal('success');
                mongoose.model('User').findOne({username: user.username}).exec(function (err, res) {
                    if (err) throw err;
                    expect(res.username).to.be.equal(user.username);
                    expect(res.salt).to.exist;
                    expect(res.hash).to.exist;
                    return done();
                });

            });
    });

    it('soll einen Fehler zurückgeben bei fehlenden Feldern', function (done) {
        return request(server)
            .post('/api/users/register')
            .send({username: 'test'})
            .expect(400)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.message).to.equal('Bitte alle Felder ausfüllen');
                return done();
            });
    });

    it('soll keine doppelten Nutzernamen geben', function (done) {
        return request(server)
            .post('/api/users/register')
            .send({username: 'test-user', password: 'neuesPW', role: 'Bearbeiter'})
            .expect(500)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.code).to.equal(11000);
                return done();
            });
    });

    it('soll einen Nutzer einloggen können', function (done) {
        return request(server)
            .post('/api/users/login')
            .send(user)
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.token).to.exist;
                return done();
            });
    });

    it('Bei Fehlenden Feldern soll eine Meldung zurückgegeben werden', function (done) {
        return request(server)
            .post('/api/users/login')
            .send({})
            .expect(400)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.message).to.equal('Bitte alle Felder ausfüllen');
                return done();
            });
    });

    it('soll einen Fehler liefern, bei falschem Passwort', function (done) {
        return request(server)
            .post('/api/users/login')
            .send({username: 'test-user', password: 'bruteforce'})
            .expect(401)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.message).to.equal('Falscher Benutzername/Passwort');
                return done();
            });
    });

    it('soll einen Fehler liefern, bei falschem Nutzernamen', function (done) {
        return request(server)
            .post('/api/users/login')
            .send({username: 'test-user2', password: 'bruteforce'})
            .expect(401)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.message).to.equal('Falscher Benutzername/Passwort');
                return done();
            });
    });

    it('soll einen Nutzer löschen können', function (done) {
        return request(server)
            .put('/api/users/delete')
            .send({username: 'test-user'})
            .expect(200)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body.n).to.be.equal(1);
                mongoose.model('User').find({username: 'test-user'}).exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.be.empty;
                    return done();
                });
            });
    });

    it('Bei falschem Nutzername soll ein Fehler geliefert werden', function (done) {
        return request(server)
            .put('/api/users/delete')
            .send({username: 'tippfehler'})
            .expect(404)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body).to.equal('Konnte keinen User mit Namen tippfehler finden.');
                return done();
            });
    });

    it('Der Nutzername berni soll nicht gelöscht werden können', function (done) {
        return request(server)
            .put('/api/users/delete')
            .send({username: 'berni'})
            .expect(500)
            .end(function (err, res) {
                if (err) throw err;
                expect(res.body).to.be.equal('Dieser User kann nicht gelöscht werden!');
                return done();
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

