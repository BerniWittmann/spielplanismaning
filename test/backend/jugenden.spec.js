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

describe('Route: Jugenden', function () {
    var jugendid;
    var anzahlTeamsJugend;
    before(function (done) {
        databaseSetup.wipeAndCreate(function (err) {
            if (err) throw err;
            done();
        });
    });

    it('soll alle Jugenden laden können', function (done) {
        return request(server)
            .get('/api/jugenden/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                jugendid = response.body[0]._id;
                return done();
            });
    });

    it('soll eine einzelne Jugend laden können', function (done) {
        return request(server)
            .get('/api/jugenden?id=' + jugendid.toString())
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Object');
                expect(response.body._id).to.be.equal(jugendid);
                anzahlTeamsJugend = response.body.teams.length;
                return done();
            });
    });

    it('soll eine Jugend hinzufügen können und eine Gruppe dafür erstellen', function (done) {
        var jugend = {
            name: 'Neue Jugend'
        };
        return request(server)
            .post('/api/jugenden')
            .send(jugend)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.exist;
                expect(response.body.name).to.be.equal(jugend.name);
                expect(response.body.gruppen).to.have.lengthOf(1);
                mongoose.model('Jugend').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(3);
                    return done();

                });
            });
    });

    it('soll die Gesamtzahl der Tore laden', function (done) {
        return request(server)
            .get('/api/jugenden/tore')
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.equal(14);
                done();
            });
    });

    it('soll die Tore für eine einzelne Jugend laden', function (done) {
        return request(server)
            .get('/api/jugenden/tore?id=' + jugendid.toString())
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.equal(5);
                done();
            });
    });

    it('soll eine Jugend löschen können und die Teams & Gruppen mitlöschen', function (done) {
        var anzahlTeamsVorher;
        mongoose.model('Team').find().exec(function (err, res) {
            if (err) throw err;
            anzahlTeamsVorher = res.length;
            return request(server)
                .del('/api/jugenden?id=' + jugendid)
                .expect(200)
                .end(function (err, res) {
                    if (err) throw err;

                    expect(res.body).to.equal('Successful');
                    mongoose.model('Jugend').findById(jugendid).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.exist;
                        mongoose.model('Team').find().exec(function (err, res) {
                            if (err) throw err;
                            expect(res.length).to.be.equal(anzahlTeamsVorher - anzahlTeamsJugend);
                            done();
                        });
                    });
                });
        });
    });
});

after(function (done) {
    databaseSetup.disconnect(done);
});

