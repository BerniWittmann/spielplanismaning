var expect = require('chai').expect;
var mongoose = require('mongoose');
var env = {};
var server = require('../testserver.js')(env);
var request = require('supertest');
var User = mongoose.model('User');

describe('Bad Request Handler', function () {
    var token;
    var userData = {
        username: 'test-admin-user',
        password: '1337-5P34K',
        role: 'Admin'
    };

    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            var user = new User();
            user.username = userData.username;
            user.setRole(userData.role);
            user.setPassword(userData.password);

            user.save(function (err) {
                if (err) {
                    throw err;
                }

                token = user.generateJWT();
                return done();
            });
        });
    });

    describe('es soll geprüft werden ob benötigte Parameter vorhanden sind', function () {
        it('Der Request soll korrekt ausgeführt werden', function (done) {
            request(server)
                .post('/api/email/')
                .set('Authorization', token)
                .send({subject: 'Test', text: 'test'})
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    return done();
                });
        });

        it('Fehlen alle Parameter soll ein Fehler geworfen werden', function (done) {
            request(server)
                .post('/api/email/')
                .set('Authorization', token)
                .send({})
                .expect(400)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(400);
                    expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                    return done();
                });
        });

        it('Fehlt ein Parameter soll ein Fehler geworfen werden', function (done) {
            request(server)
                .post('/api/email/')
                .set('Authorization', token)
                .send({subject: 'Test'})
                .expect(400)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(400);
                    expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                    return done();
                });
        });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

