var expect = require('chai').expect;
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var env = {};
var server = require('../testserver.js')(env);
var request = require('supertest');
var User = mongoose.model('User');
var _ = require('lodash');
var async = require('async');
var path = require('path');
var helpers = require('../../../src/routes/helpers.js')();
var fs = require('fs');
var routes = JSON.parse(fs.readFileSync(path.join(__dirname, '/../../../src/routes/middleware/routeConfig.json'), 'utf8'));

describe('API Authorization', function () {
    var token;
    var userData = {
        username: 'test-user',
        password: '1337-5P34K',
        role: 'Admin'
    };
    var user2Data = {
        username: 'test-user2',
        password: '1337-5P34K',
        role: 'Bearbeiter'
    };

    var userNameToBeDeleted = 'test';

    var roleTokens = {
        admin: server.adminToken,
        bearbeiter: server.bearbeiterToken
    };

    var exampleTokenPayload = {
        _id: '1234',
        username: 'test-user',
        role: {
            name: 'Tütü',
            rank: 99
        },
        checksum: 'b8aa411b45ac08c37ee3780f4854d2e9'
    };

    var ALL_ROLES = ['admin', 'bearbeiter'];

    before(function (done) {
        server.connectDB(function (err) {
            if (err) throw err;

            async.parallel([
                    function (done) {
                        var user = new User();
                        user.username = userData.username;
                        user.setRole(userData.role);
                        user.setPassword(userData.password);

                        user.save(function (err) {
                            if (err) {
                                throw err;
                            }

                            token = user.generateJWT();
                            roleTokens.admin = token;
                            return done();
                        });
                    },
                    function (done) {
                        var user2 = new User();
                        user2.username = user2Data.username;
                        user2.setRole(user2Data.role);
                        user2.setPassword(user2Data.password);

                        user2.save(function (err) {
                            if (err) {
                                throw err;
                            }

                            roleTokens.bearbeiter = user2.generateJWT();
                            return done();
                        });
                    }],
                function (err) {
                    if (err) {
                        throw err;
                    }
                    return done();
                });
        });
    });

    describe('API Authorization: Es wird keine bestimmte Rolle benötigt', function () {
        it('Der Request soll ausgeführt werden', function (done) {
            request(server)
                .get('/api/teams/')
                .set('Authorization', token)
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    return done();
                });
        });
    });

    describe('API Authorization: Es wird eine bestimmte Rolle benötigt', function () {
        it('wenn kein Token vorhanden ist soll, ein Fehler gemeldet werden', function (done) {
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .expect(401)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(401);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_NOT_AUTHORIZED');
                    return done();
                });
        });

        it('wenn ein falscher Token vorhanden ist, soll ein Fehler gemeldet werden', function (done) {
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', jwt.sign(exampleTokenPayload, 'FALSESECRET'))
                .expect(403)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(403);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                    return done();
                });
        });

        it('wenn der Nutzer nicht in der Datenbank vorhanden ist, soll ein Fehler gemeldet werden', function (done) {
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', jwt.sign(exampleTokenPayload, process.env.SECRET))
                .expect(403)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(403);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                    return done();
                });
        });

        it('wenn die Rollen nicht übereinstimmen, soll ein Fehler gemeldet werden', function (done) {
            exampleTokenPayload.username = userData.username;
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', jwt.sign(exampleTokenPayload, process.env.SECRET))
                .expect(403)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(403);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                    return done();
                });
        });

        it('wenn der Nutzer nicht die passende Rolle hat, soll ein Fehler gemeldet werden', function (done) {
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', server.bearbeiterToken)
                .expect(403)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(403);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                    return done();
                });
        });

        it('wenn die Checksummen nicht stimmen, soll ein Fehler gemeldet werden', function (done) {
            var token = jwt.verify(roleTokens.bearbeiter, process.env.SECRET);
            token.role = {
                name: 'Admin',
                rank: 1
            };
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', jwt.sign(token, process.env.SECRET))
                .expect(403)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(403);
                    expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                    return done();
                });
        });

        it('wenn der Nutzer eine passende Rolle hat, soll der Request ausgeführt werden', function (done) {
            request(server)
                .put('/api/users/delete')
                .send({username: userNameToBeDeleted})
                .set('Authorization', server.adminToken)
                .expect(200)
                .end(function (err, response) {
                    if (err) return done(err);
                    expect(response).not.to.be.undefined;
                    expect(response.statusCode).to.equal(200);
                    expect(response.body.MESSAGEKEY).to.be.equal('SUCCESS_DELETE_MESSAGE');
                    return done();
                });
        });
    });

    function getRequestByMethod(method, route) {
        if (method == 'GET') {
            return request(server).get(route)
        } else if (method == 'POST') {
            return request(server).post(route)
        } else if (method == 'PUT') {
            return request(server).put(route)
        } else if (method == 'DELETE') {
            return request(server).delete(route)
        }
    }

    describe('Prüfung der Routen', function () {
        _.forEach(Object.keys(routes), function (routeKey) {
            if (!_.isUndefined(routes[routeKey].AUTH) && !_.isNull(routes[routeKey].AUTH)) {
                describe('die Route ' + routeKey + ' soll geschützt sein', function () {
                    var route = routes[routeKey].AUTH;
                    var isCompletelyProtected = _.isArray(route) || _.isString(route);

                    var methods = ['GET', 'POST', 'PUT', 'DELETE'];
                    _.forEach(methods, function (method) {
                        if (isCompletelyProtected || route[method]) {
                            var roles = helpers.getRequiredRouteConfig(routes, routeKey, method, 'AUTH');
                            var otherRoles = _.difference(ALL_ROLES, roles);
                            it(method + ' ' + routeKey + ': sollte ohne Authorisierung nicht zugänglich sein', function (done) {
                                getRequestByMethod(method, routeKey)
                                    .end(function (err, response) {
                                        if (err) return done(err);
                                        expect(response).not.to.be.undefined;
                                        expect(response.statusCode).to.equal(401);
                                        expect(response.body.MESSAGEKEY).to.be.equal('ERROR_NOT_AUTHORIZED');
                                        return done();
                                    });
                            });

                            _.forEach(otherRoles, function (falseRole) {
                                it(method + ' ' + routeKey + ': sollte für ' + falseRole + ' nicht zugänglich sein', function (done) {
                                    getRequestByMethod(method, routeKey)
                                        .set('Authorization', roleTokens[falseRole])
                                        .end(function (err, response) {
                                            if (err) return done(err);
                                            expect(response).not.to.be.undefined;
                                            expect(response.statusCode).to.equal(403);
                                            expect(response.body.MESSAGEKEY).to.be.equal('ERROR_FORBIDDEN');
                                            return done();
                                        });
                                });
                            });

                            _.forEach(roles, function (role) {
                                it(method + ' ' + routeKey + ': sollte für ' + role + ' zugänglich sein', function (done) {
                                    getRequestByMethod(method, routeKey)
                                        .set('Authorization', roleTokens[role])
                                        .end(function (err, response) {
                                            if (err) return done(err);
                                            expect(response).not.to.be.undefined;
                                            expect(response.statusCode).not.to.be.equal(403);
                                            expect(response.statusCode).not.to.be.equal(401);
                                            return done();
                                        });
                                });
                            });
                        }
                    });
                });
            }
        });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});

