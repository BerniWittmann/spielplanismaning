var expect = require('chai').expect;
var request = require("supertest");
var server = require('./testserver.js')();
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
        email: 'test@byom.de',
        password: '1337-5P34K',
        role: 'Bearbeiter',
        token: undefined
    };

    var resetToken;
    var hashBefore;
    var username;

    it('soll einen Nutzer registrieren können', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken())
            .send({
                username: user.username,
                email: user.email,
                role: user.role
            })
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
                    expect(res.resetToken).to.exist;
                    token = res.generateJWT();
                    return done();
                });

            });
    });

    it('soll einen Fehler zurückgeben bei fehlenden Feldern', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken())
            .send({username: 'test'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('soll keine doppelten Nutzernamen geben', function (done) {
        request(server)
            .post('/api/users/register')
            .set('Authorization', server.adminToken())
            .send({username: 'test-user', email: 'test2@byom.de', role: 'Bearbeiter'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(409);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_USER_ALREADY_EXISTS');
                expect(res.body.MESSAGE).to.equal('Benutzer test-user existiert bereits');
                return done();
            });
    });

    it('soll einen Nutzer einloggen können', function (done) {
        mongoose.model('User').findOne({username: user.username}).exec(function (err, usr) {
            if (err) return done(err);

            usr.setPassword(user.password);

            usr.save(function (err, res) {
                if (err) return done(err);

                request(server)
                    .post('/api/users/login')
                    .send({
                        username: user.username,
                        password: user.password
                    })
                    .end(function (err, res) {
                        if (err) return done(err);
                        expect(res).not.to.be.undefined;
                        expect(res.statusCode).to.equal(200);
                        expect(res.body.token).to.exist;
                        user.token = res.body.token;
                        return done();
                    });
            });
        });

    });

    it('Bei Fehlenden Feldern soll eine Meldung zurückgegeben werden', function (done) {
        request(server)
            .post('/api/users/login')
            .send({})
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
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(401);
                expect(res.body.MESSAGEKEY).to.equal('ERROR_FALSCHE_ANMELDEDATEN');
                return done();
            });
    });

    it('Bei falschem Nutzername soll ein Fehler geliefert werden', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken())
            .send({username: 'tippfehler'})
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
            .set('Authorization', server.adminToken())
            .send({username: 'berni'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(403);
                expect(res.body.MESSAGEKEY).to.be.equal('ERROR_USER_NICHT_LOESCHBAR');
                return done();
            });
    });

    it('Ein Nutzer soll den Nutzernamen ändern können', function (done) {
        request(server)
            .put('/api/users/user-details')
            .set('Authorization', user.token)
            .send({username: 'testuser', email: 'test@byom.de'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.username).to.equal('testuser');
                user.token = res.body.token;
                return done();
            });
    });

    it('Ein Nutzer soll ein neues Passwort anfordern können', function (done) {
        request(server)
            .put('/api/users/password-forgot')
            .set('Authorization', server.bearbeiterToken())
            .send({email: 'test@byom.de'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.MESSAGEKEY).to.be.equal('SUCCESS_MESSAGE');
                return done();
            });
    });

    it('soll prüfen können ob ein ResetToken gültig ist', function (done) {
        mongoose.model('User').findOne({email: 'test@byom.de'}).exec(function (err, usr) {
            if (err) return done(err);

            resetToken = usr.resetToken;
            hashBefore = usr.hash;
            username = usr.username;
            request(server)
                .put('/api/users/password-reset/check')
                .send({token: resetToken})
                .end(function (err, res) {
                    if (err) return done(err);
                    expect(res).not.to.be.undefined;
                    expect(res.statusCode).to.equal(200);
                    expect(res.body.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
                    return done();
                });
        });
    });

    it('soll ein neues Passwort speichern', function (done) {
        request(server)
            .put('/api/users/password-reset')
            .send({token: resetToken, username: username, password: 'allesneumachtdermai'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.MESSAGEKEY).to.equal('SUCCESS_MESSAGE');
                return mongoose.model('User').findOne({username: username}).exec(function (err, usr) {
                    if(err) return done(err);

                    expect(usr.hash).not.to.be.equal(hashBefore);
                    expect(usr.resetToken).not.to.exist;

                    return done();
                });
            });
    });

    it('Ein Nutzer soll die Email ändern können', function (done) {
        request(server)
            .put('/api/users/user-details')
            .set('Authorization', user.token)
            .send({username: 'testuser', email: 'test1@byom.de'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.email).to.equal('test1@byom.de');
                user.token = res.body.token;
                return done();
            });
    });

    it('Ein Nutzer soll seine eigenen NutzerDetails laden können', function (done) {
        request(server)
            .get('/api/users/user-details')
            .set('Authorization', user.token)
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(200);
                expect(res.body.email).to.equal('test1@byom.de');
                expect(res.body.username).to.equal('testuser');
                expect(res.body.role.name).to.equal('Bearbeiter');
                return done();
            });
    });

    it('wenn zum Löschen kein Nutzername angegeben ist, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken())
            .send({})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(400);
                expect(res.body.MESSAGEKEY).to.be.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('wenn der Nutzername nicht gefunden Wird, soll ein Fehler geworfen werden', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken())
            .send({username: 'wrongname'})
            .end(function (err, res) {
                if (err) return done(err);
                expect(res).not.to.be.undefined;
                expect(res.statusCode).to.equal(404);
                expect(res.body.MESSAGEKEY).to.be.equal('ERROR_USER_NOT_FOUND');
                return done();
            });
    });

    it('soll einen Nutzer löschen können', function (done) {
        request(server)
            .put('/api/users/delete')
            .set('Authorization', server.adminToken())
            .send({username: 'testuser'})
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

    after(function (done) {
        server.disconnectDB(done);
    });
});

