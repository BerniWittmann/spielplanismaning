var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Gruppen', function () {
    var jugendid;
    var anzahlVorher = 2;
    var gruppeid = '57cffb4055a8d45fc084c108';
    var neueGruppeId;
    var neueGruppeJugend;
    var anzahlTeamsGruppe;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            mongoose.model('Jugend').find({name: 'Jugend 2'}).exec(function (err, res) {
                if (err) throw err;
                jugendid = res[0]._id;
                done();
            });
        });
    });

    it('soll alle Gruppen laden können', function (done) {
        return request(server)
            .get('/api/gruppen/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(3);
                expect(response.body[0].name).to.be.equal('Gruppe A');
                expect(response.body[1].name).to.be.equal('Gruppe A');
                expect(response.body[2].name).to.be.equal('Gruppe B');
                gruppeid = response.body[0]._id;
                return done();
            });
    });

    it('soll eine einzelne Gruppe laden können', function (done) {
        return request(server)
            .get('/api/gruppen?id=' + gruppeid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.be.a('Object');
                expect(response.body._id).to.be.equal(gruppeid);
                expect(response.body.name).to.be.equal('Gruppe A');
                expect(response.body.jugend.name).to.be.equal('Jugend 1');
                anzahlTeamsGruppe = response.body.teams.length;
                return done();
            });
    });

    it('soll die Gruppen einer Jugend laden können', function (done) {
        return request(server)
            .get('/api/gruppen?jugend=' + jugendid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].name).to.be.equal('Gruppe A');
                expect(response.body[1].name).to.be.equal('Gruppe B');
                expect(response.body[0].jugend._id.toString()).to.be.equal(jugendid.toString());
                expect(response.body[1].jugend._id.toString()).to.be.equal(jugendid.toString());
                expect(response.body[0].jugend.name).to.be.equal('Jugend 2');
                expect(response.body[1].jugend.name).to.be.equal('Jugend 2');
                anzahlVorher = response.body.length;
                return done();
            });
    });

    it('soll eine Gruppe hinzufügen können', function (done) {
        var gruppe = {
            name: 'Neue Gruppe'
        };
        return request(server)
            .post('/api/gruppen?jugend=' + jugendid.toString())
            .send(gruppe)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id).to.exist;
                expect(response.body.name).to.be.equal(gruppe.name);
                expect(response.body.jugend).to.be.equal(jugendid.toString());
                neueGruppeId = response.body._id;
                neueGruppeJugend = response.body.jugend;
                mongoose.model('Gruppe').find({jugend: jugendid.toString()}).exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(anzahlVorher + 1);
                    return done();
                });
            });
    });

    it('soll beim Hinzufügen einer Fünften Gruppe einen Fehler werfen', function (done) {
        //Test vorbereitung
        var gruppe = {
            name: 'Gruppe D'
        };
        return request(server)
            .post('/api/gruppen?jugend=' + jugendid.toString())
            .send(gruppe)
            .expect(200)
            .end(function (err) {
                if (err) throw err;

                //Eigentliche Testausführung
                gruppe = {
                    name: 'Letzte Gruppe'
                };
                return request(server)
                    .post('/api/gruppen?jugend=' + jugendid.toString())
                    .send(gruppe)
                    .expect(418)
                    .set('Accept', 'application/json')
                    .end(function (err, response) {
                        if (err) return done(err);
                        expect(response).not.to.be.undefined;
                        expect(response.statusCode).to.equal(418);
                        expect(response.body.message).to.exist;
                        expect(response.body.message).to.be.equal('Maximalzahl an Gruppen für diese Jugend erreicht');
                        return done();
                    });
            });
    });

    it('soll eine Gruppe löschen können und die Teams mitlöschen', function (done) {
        return request(server)
            .post('/api/teams?jugend=' + neueGruppeJugend + '&gruppe=' + neueGruppeId)
            .send({name: 'Test Team'})
            .expect(200)
            .end(function (err) {
                if (err) throw err;
                var anzahlTeamsVorher;

                mongoose.model('Team').find().exec(function (err, res) {
                    if (err) throw err;
                    anzahlTeamsVorher = res.length;
                    return request(server)
                        .del('/api/gruppen?id=' + neueGruppeId)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) throw err;
                            expect(res.body).to.equal('success');
                            mongoose.model('Gruppe').findById(neueGruppeId).exec(function (err, res) {
                                if (err) throw err;
                                expect(res).not.to.exist;
                                mongoose.model('Team').find().exec(function (err, res) {
                                    if (err) throw err;
                                    expect(res.length).to.be.equal(anzahlTeamsVorher - 1);
                                    done();
                                });
                            });
                        });
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});



