var expect = require('chai').expect;
var request = require("supertest");
var env = {};
var server = require('./testserver.js')(env);
var mongoose = require('mongoose');
var Ansprechpartner = mongoose.model('Ansprechpartner');

describe('Route: Ansprechpartner', function () {
    var neuerAnsprechpartnerId;
    var initialerAnsprechpartner = {
        name: 'Test Name',
        turnier: 'Test Turnier',
        email: 'email@byom.de'
    };
    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;
            var ansprechpartner = new Ansprechpartner(initialerAnsprechpartner);

            ansprechpartner.save(function (err, res) {
                if (err) {
                    throw err;
                }
                expect(res._id).not.to.be.undefined;
                initialerAnsprechpartner._id = res._id.toString();
                return done();
            });
        });
    });

    it('soll einen Ansprechpartner hinzufügen können', function (done) {
        var ansprechpartner = {
            name: 'Hans Meyer',
            turnier: 'Test Turnier',
            email: 'test@byom.de'
        };
        request(server)
            .post('/api/ansprechpartner')
            .send(ansprechpartner)
            .set('Authorization', server.adminToken)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body.name).to.be.equal(ansprechpartner.name);
                expect(response.body.email).to.be.equal(ansprechpartner.email);
                expect(response.body.turnier).to.be.equal(ansprechpartner.turnier);
                expect(response.body._id).not.to.be.undefined;
                var neuerAnsprechpartnerId = response.body._id;
                mongoose.model('Ansprechpartner').findById(neuerAnsprechpartnerId).exec(function (err, res) {
                    if (err) throw err;
                    expect(res).not.to.be.undefined
                    expect(res._id.toString()).to.equal(neuerAnsprechpartnerId.toString());
                    return done();
                });
            });
    });

    it('soll alle Ansprechpartner laden', function (done) {
        request(server)
            .get('/api/ansprechpartner')
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body).to.have.lengthOf(2);
                return done();
            });
    });

    it('soll einen einzelnen Ansprechpartner laden', function (done) {
        request(server)
            .get('/api/ansprechpartner')
            .query({id: initialerAnsprechpartner._id})
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                expect(response.body._id.toString()).to.equal(initialerAnsprechpartner._id);
                expect(response.body).to.contain.keys(initialerAnsprechpartner);
                return done();
            });
    });

    describe('soll einen Ansprechpartner ändern können', function () {
        it('der Name soll geändert werden können', function (done) {
            var data = {
                name: 'neuer Name'
            };
            request(server)
                .put('/api/ansprechpartner')
                .query({id: initialerAnsprechpartner._id})
                .send(data)
                .set('Authorization', server.adminToken)
                .set('Accept', 'application/json')
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.name).to.be.equal(data.name);
                    expect(response.body._id).not.to.be.undefined;
                    var id = response.body._id;
                    mongoose.model('Ansprechpartner').findById(id).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.be.undefined
                        expect(res._id.toString()).to.equal(id.toString());
                        expect(res.name).to.equal(data.name);
                        return done();
                    });
                });
        });

        it('die Email soll geändert werden können', function (done) {
            var data = {
                email: 'neue@mail.de'
            };
            request(server)
                .put('/api/ansprechpartner')
                .query({id: initialerAnsprechpartner._id})
                .send(data)
                .set('Authorization', server.adminToken)
                .set('Accept', 'application/json')
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.email).to.be.equal(data.email);
                    expect(response.body._id).not.to.be.undefined;
                    var id = response.body._id;
                    mongoose.model('Ansprechpartner').findById(id).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.be.undefined
                        expect(res._id.toString()).to.equal(id.toString());
                        expect(res.email).to.equal(data.email);
                        return done();
                    });
                });
        });

        it('das Turnier soll geändert werden können', function (done) {
            var data = {
                turnier: 'neues Turnier mit Name'
            };
            request(server)
                .put('/api/ansprechpartner')
                .query({id: initialerAnsprechpartner._id})
                .send(data)
                .set('Authorization', server.adminToken)
                .set('Accept', 'application/json')
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.turnier).to.be.equal(data.turnier);
                    expect(response.body._id).not.to.be.undefined;
                    var id = response.body._id;
                    mongoose.model('Ansprechpartner').findById(id).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.be.undefined
                        expect(res._id.toString()).to.equal(id.toString());
                        expect(res.turnier).to.equal(data.turnier);
                        return done();
                    });
                });
        });

        it('Änderungen sollen auch gleichzeitig durchführbar seien', function (done) {
            var data = {
                turnier: 'turnier',
                name: 'name',
                email: 't@t.de'
            };
            request(server)
                .put('/api/ansprechpartner')
                .query({id: initialerAnsprechpartner._id})
                .send(data)
                .set('Authorization', server.adminToken)
                .set('Accept', 'application/json')
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.name).to.be.equal(data.name);
                    expect(response.body.email).to.be.equal(data.email);
                    expect(response.body.turnier).to.be.equal(data.turnier);
                    expect(response.body._id).not.to.be.undefined;
                    var id = response.body._id;
                    mongoose.model('Ansprechpartner').findById(id).exec(function (err, res) {
                        if (err) throw err;
                        expect(res).not.to.be.undefined
                        expect(res._id.toString()).to.equal(id.toString());
                        expect(res.name).to.equal(data.name);
                        expect(res.email).to.equal(data.email);
                        expect(res.turnier).to.equal(data.turnier);
                        return done();
                    });
                });
        });
    });

    it('soll einen Ansprechpartner löschen können', function (done) {
        request(server)
            .delete('/api/ansprechpartner')
            .query({id: neuerAnsprechpartnerId})
            .set('Authorization', server.adminToken)
            .set('Accept', 'application/json')
            .end(function (err, response) {
                if (err) return done(err);
                expect(response).not.to.be.undefined;
                expect(response.statusCode).to.equal(200);
                mongoose.model('Ansprechpartner').findById(neuerAnsprechpartnerId).exec(function (err, res) {
                    if (err) throw err;
                    expect(res).to.equal(null);
                    return done();
                });
            });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});



