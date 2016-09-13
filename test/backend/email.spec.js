var expect = require('chai').expect;
var request = require("supertest");
var env = {
    ENVIRONMENT: 'TESTING',
    LOCKDOWNMODE: 'true',
    MONGO_DB_URI: 'mongodb://localhost/spielplan-test'
};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');
var databaseSetup = require('./database-setup/database-setup')(env.MONGO_DB_URI);

describe('Route: Email', function () {
    var teamid;
    before(function (done) {
        databaseSetup.wipeAndCreate(function (err) {
            if (err) throw err;
            mongoose.model('Team').find({name: 'Team AA 1'}).exec(function (err, res) {
                if (err) throw err;
                console.log(res);
                console.log(err);
                teamid = res[0]._id;
                done();
            });
        });
    });

    it('soll Abonnenten hinzufügen können', function (done) {
        var abonnement = {
            email: 'test@t.de',
            team: teamid
        };
        return request(server)
            .post('/api/email/subscriber')
            .send(abonnement)
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.email).to.be.equal('test@t.de');
                expect(response.body._id).to.exist;
                return done();
            });
    });

    it('Sendet eine Email an alle Abonennten', function (done) {
        var email = {
            subject: 'Betreff',
            text: 'Test-Email Text'
        };
        return request(server)
            .post('/api/email/')
            .send(email)
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                return done();
            });
    });

    it('soll die Abonnenten laden', function (done) {
        return request(server)
            .get('/api/email/subscriber')
            .expect(200)
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
        return request(server)
            .del('/api/email/subscriber?email=test@t.de&team=' + teamid)
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.n).to.be.equal(1);
                return mongoose.model('Subscriber').find({}).exec(function (err, subs) {
                    if (err) return done(err);
                    expect(subs).to.have.lengthOf(1);
                    expect(subs[0].email).to.be.equal('test@test.de');
                    return done();
                });
            });
    });

    after(function (done) {
        databaseSetup.disconnect(done);
    });
});

