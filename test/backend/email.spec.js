var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Email', function () {
    var teamid;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            return mongoose.model('Team').find({name: 'Team AA 1'}).exec(function (err, res) {
                if (err) throw err;
                teamid = res[0]._id;
                return done();
            });
        });
    });

    it('soll Abonnenten hinzufügen können', function (done) {
        var abonnement = {
            email: 'test@t.de',
            team: teamid
        };
        request(server)
            .post('/api/email/subscriber')
            .send(abonnement)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.email).to.be.equal(abonnement.email);
                expect(response.body._id).to.exist;
                return mongoose.model('Subscriber').findOne({email: abonnement.email}).exec(function (err, res) {
                    if (err) return done(err);

                    expect(res).not.to.be.undefined;
                    expect(res.email).to.be.equal(abonnement.email);
                    return done();
                });
            });
    });

    it('Bei leerem Betreff soll ein Fehler geworfen werden', function (done) {
        var email = {
            text: 'Test-Email Text'
        };
        request(server)
            .post('/api/email/')
            .send(email)
            .set('Authorization', server.adminToken)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('Bei leerem Text soll ein Fehler geworfen werden', function (done) {
        var email = {
            betreff: 'Test-Email Betreff'
        };
        request(server)
            .post('/api/email/')
            .send(email)
            .set('Authorization', server.adminToken)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(400);
                expect(response.body.MESSAGEKEY).to.equal('ERROR_BAD_REQUEST');
                return done();
            });
    });

    it('Sendet eine Email an alle Abonennten', function (done) {
        var email = {
            subject: 'Betreff',
            text: 'Test-Email Text'
        };
        request(server)
            .post('/api/email/')
            .send(email)
            .set('Authorization', server.adminToken)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                return done();
            });
    });

    it('soll die Abonnenten laden', function (done) {
        request(server)
            .get('/api/email/subscriber')
            .set('Authorization', server.adminToken)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[1].email).to.be.equal('test@t.de');
                return done();
            });
    });

    it('soll Abonnenten löschen können', function (done) {
        request(server)
            .del('/api/email/subscriber?email=test@t.de&team=' + teamid)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.equal('SUCCESS_DELETE_MESSAGE');
                return mongoose.model('Subscriber').find({}).exec(function (err, subs) {
                    if (err) return done(err);
                    expect(subs).to.have.lengthOf(1);
                    expect(subs[0].email).to.be.equal('test@test.de');
                    return done();
                });
            });
    });

    it('Sendet einen Bug-Report', function (done) {
        var email = {
            name: 'Vorname Nachname',
            vorname: 'Vorname',
            nachname: 'Nachname',
            text: 'Text',
            title: 'Title',
            env: 'testing',
            version: '0.0.0',
            rolle: 'Admin',
            username: 'username',
            email: 'test@byom.de',
            datetime: '14.01.2017 09:41'
        };
        request(server)
            .post('/api/email/bug')
            .send(email)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                return done();
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

