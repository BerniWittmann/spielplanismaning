var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Jugenden', function () {
    var jugendid;
    var neueJugendid;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            done();
        });
    });

    it('soll alle Jugenden laden können', function (done) {
       request(server)
            .get('/api/jugenden/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                jugendid = response.body[1]._id;
                return done();
            });
    });

    it('soll eine einzelne Jugend laden können', function (done) {
        request(server)
            .get('/api/jugenden?id=' + jugendid.toString())
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Object');
                expect(response.body._id).to.be.equal(jugendid);
                return done();
            });
    });

    it('soll eine Jugend hinzufügen können und eine Gruppe dafür erstellen', function (done) {
        var jugend = {
            name: 'Neue Jugend'
        };
        request(server)
            .post('/api/jugenden')
            .send(jugend)
            .expect(200)
            .set('Authorization', server.adminToken)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.exist;
                expect(response.body.name).to.be.equal(jugend.name);
                neueJugendid = response.body._id;
                expect(response.body.gruppen).to.have.lengthOf(1);
                mongoose.model('Jugend').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(3);
                    return done();

                });
            });
    });

    it('soll die Gesamtzahl der Tore laden', function (done) {
        request(server)
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
        request(server)
            .get('/api/jugenden/tore?id=' + jugendid.toString())
            .expect(200)
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.equal(9);
                done();
            });
    });

    it('soll eine Jugend löschen können und die Teams & Gruppen mitlöschen', function (done) {
        var anzahlGruppenVorher;
        mongoose.model('Gruppe').find().exec(function (err, res) {
            if (err) throw err;
            anzahlGruppenVorher = res.length;
            request(server)
                .del('/api/jugenden?id=' + neueJugendid)
                .expect(200)
                .set('Authorization', server.adminToken)
                .end(function (err, res) {
                    if (err) throw err;

                    expect(res.body.MESSAGEKEY).to.equal('SUCCESS_DELETE_MESSAGE');
                    mongoose.model('Jugend').findById(neueJugendid).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.exist;
                        mongoose.model('Gruppe').find().exec(function (err, res) {
                            if (err) throw err;
                            expect(res.length).to.be.below(anzahlGruppenVorher);
                            done();
                        });
                    });
                });
        });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

