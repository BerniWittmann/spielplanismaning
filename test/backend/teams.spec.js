var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');

describe('Route: Teams', function () {
    var jugendid;
    var gruppeid;
    var teamid;
    var neuesTeamid;
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            mongoose.model('Jugend').find({name: 'Jugend 2'}).exec(function (err, res) {
                if (err) throw err;
                jugendid = res[0]._id;
                gruppeid = res[0].gruppen[0];
                done();
            });
        });
    });

    it('soll alle Teams laden können', function (done) {
        return request(server)
            .get('/api/teams/')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(8);
                teamid = response.body[0]._id;
                return done();
            });
    });

    it('soll ein einzelnes Team laden können', function (done) {
        return request(server)
            .get('/api/teams?id=' + teamid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(1);
                expect(response.body[0]._id).to.be.equal(teamid);
                expect(response.body[0].name).to.be.equal('Team BA 1');
                return done();
            });
    });

    it('soll die Teams einer Jugend laden können', function (done) {
        return request(server)
            .get('/api/teams?jugend=' + jugendid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(5);
                expect(response.body[0].jugend._id.toString()).to.be.equal(jugendid.toString());
                return done();
            });
    });

    it('soll die Teams einer Gruppe laden können', function (done) {
        return request(server)
            .get('/api/teams?gruppe=' + gruppeid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                expect(response.body[0].gruppe._id.toString()).to.be.equal(gruppeid.toString());
                return done();
            });
    });

    it('soll ein Team hinzufügen können', function (done) {
        var neuesTeam = {
            name: 'FC Bayern München'
        };
        return request(server)
            .post('/api/teams?jugend=' + jugendid + '&gruppe=' + gruppeid)
            .send(neuesTeam)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.name).to.be.equal(neuesTeam.name);
                neuesTeamid = response.body._id;
                mongoose.model('Gruppe').findById(gruppeid).exec(function (err, res) {
                    if (err) throw err;
                    expect(res.teams).to.have.lengthOf(3);
                    expect(res.teams).to.contain(neuesTeamid.toString());
                    return done();
                });
            });
    });

    it('soll den Namen eines Teams aktualisieren können', function (done) {
        var reqbody = {
            name: 'Neuer Name'
        };
        return request(server)
            .put('/api/teams?id=' + neuesTeamid)
            .send(reqbody)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.name).to.be.equal(reqbody.name);
                expect(response.body._id).to.be.equal(neuesTeamid.toString());
                mongoose.model('Team').findById(neuesTeamid).exec(function (err, res) {
                    if (err) throw err;
                    expect(res.name).to.be.equal(reqbody.name);
                    return done();
                });
            });
    });

    it('soll ein Team löschen', function (done) {
        return request(server)
            .del('/api/teams?id=' + neuesTeamid)
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                mongoose.model('Team').find().exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.have.lengthOf(8);
                    mongoose.model('Gruppe').findById(gruppeid).exec(function (err, res) {
                        if (err) throw err;
                        expect(res.teams).to.have.lengthOf(2);
                        expect(res.teams).not.to.contain(neuesTeamid.toString());
                        return done();
                    });
                });
            });
    });

    it('soll die Ergebnisse aller Teams zurücksetzen', function (done) {
        return request(server)
            .put('/api/teams/resetErgebnisse')
            .expect(200)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.MESSAGEKEY).to.be.equal('RESET_MESSAGE');
                mongoose.model('Team').find().exec(function (err, res) {
                    if (err) throw err;
                    res.forEach(function (team) {
                        expect(team.tore).to.be.equal(0);
                        expect(team.gtore).to.be.equal(0);
                        expect(team.punkte).to.be.equal(0);
                        expect(team.gpunkte).to.be.equal(0);
                    });
                    return done();
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});



