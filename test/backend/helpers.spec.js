var expect = require('chai').expect;
var _ = require('lodash');
var helpers = require('../../src/routes/helpers.js')();
var server = require('./testserver.js')();

describe('Helpers', function () {
    describe('soll die Datenbank query basierend auf Parametern laden', function () {
        var model = {
            find: function (object) {
                if (_.isUndefined(object)) {
                    return 'all';
                } else if (_.isEmpty(object)) {
                    return {
                        or: function () {
                            return 'team';
                        }
                    };
                } else if (_.isEqual(_.keys(object)[0], 'gruppe')) {
                    return 'gruppe';
                } else if (_.isEqual(_.keys(object)[0], 'jugend')) {
                    return 'jugend';
                } else {
                    return 'query';
                }
            },
            findById: function () {
                return 'id';
            }
        };

        it('soll das Query für alle Entities zurückgegeben', function () {
            var req = {query: {}, body: {}};
            var data = helpers.getEntityQuery(model, req);
            expect(data.searchById).to.be.false;
            expect(data.query).to.equal('all');
        });

        it('soll das Query für ein einzelnes Entity zurückgegeben', function () {
            var req = {query: {id: '1234'}, body: {}};
            var data = helpers.getEntityQuery(model, req);
            expect(data.searchById).to.be.true;
            expect(data.query).to.equal('id');
        });

        it('soll das Query für ein Entity gefiltert nach Team zurückgegeben', function () {
            var req = {query: {team: '1234'}, body: {}};
            var data = helpers.getEntityQuery(model, req);
            expect(data.searchById).to.be.false;
            expect(data.query).to.equal('team');
        });

        it('soll das Query für ein Entity gefiltert nach Gruppe zurückgegeben', function () {
            var req = {query: {gruppe: '1234'}, body: {}};
            var data = helpers.getEntityQuery(model, req);
            expect(data.searchById).to.be.false;
            expect(data.query).to.equal('gruppe');
        });

        it('soll das Query für ein Entity gefiltert nach Jugend zurückgegeben', function () {
            var req = {query: {jugend: '1234'}, body: {}};
            var data = helpers.getEntityQuery(model, req);
            expect(data.searchById).to.be.false;
            expect(data.query).to.equal('jugend');
        });
    });

    describe('soll das Team-Ergebnis zurücksetzen können', function () {
        function resetErgebnisTest(tA, tAo, tB, tBo, pA, pAo, pB, pBo, callback) {
            expect(tA).to.equal(0);
            expect(tB).to.equal(0);
            expect(pA).to.equal(0);
            expect(pB).to.equal(0);
            expect(tAo).to.be.above(0);
            expect(tBo).to.be.above(0);
            expect(pAo).to.be.above(0);
            expect(pBo).to.be.above(0);
            callback();
        }

        var spiel = {
            teamA: {
                setErgebnis: resetErgebnisTest
            },
            teamB: {
                setErgebnis: resetErgebnisTest
            }
        };
        var mock = {
            callback: function () {
                mock.called = true;
            },
            called: false
        };
        var oldData = {
            toreA: 5,
            toreB: 5,
            punkteA: 1,
            punkteB: 1
        };
        it('soll das Ergebnis für Team A zurücksetzen', function () {
            helpers.resetErgebnis({}, spiel, oldData, 'teamA', mock.callback);
            expect(mock.called).to.be.true;
        });

        it('soll das Ergebnis für Team B zurücksetzen', function () {
            helpers.resetErgebnis({}, spiel, oldData, 'teamB', mock.callback);
            expect(mock.called).to.be.true;
        });
    });

    it('soll einem Entity ein Team hinzufügen', function () {
        var data = {
            pushTeams: function (team, cb) {
                data.pushed = team;
                return cb();
            },
            callback: function () {
                data.callbacked = true;
            },
            pushed: undefined,
            callbacked: false
        };
        var model = {
            findById: function () {
                return {
                    exec: function (cb) {
                        return cb(null, data)
                    }
                }
            }
        }
        var team = {id: '123', name: 'test'};
        helpers.findEntityAndPushTeam(model, '123', team, {}, data.callback);
        expect(data.pushed).to.deep.equal(team);
        expect(data.callbacked).to.be.true;
    });

    it('soll ein Entity anhand eines Parameters enfernen', function () {
        var model = {
            remove: function (query, cb) {
                model.query = query;
                return cb();
            },
            query: undefined
        };
        var query = {
            id: '1234'
        };

        helpers.removeEntityBy(model, 'id', '1234', {}, function () {
        });
        expect(model.query).to.deep.equal(query);
    });

    describe('soll den letzten Slash bei einem Pfad entfernen können', function () {
        it('wenn der Pfad einen Slash am Ende hat, soll er abgeschnitten werden', function () {
            var path = '/test/path/';
            var result = helpers.removeLastSlashFromPath(path);
            expect(result).to.equal('/test/path');
        });

        it('wenn der Pfad keinen Slash am Ende hat, soll er unverändert bleiben', function () {
            var path = '/test/path';
            var result = helpers.removeLastSlashFromPath(path);
            expect(result).to.equal(path);
        });
    });

    it('soll einen Token validieren', function () {
        var token = server.adminToken;
        var req = {
            get: function (text) {
                if (text === 'Authorization') {
                    return token;
                }
                return undefined;
            }
        };
        var result = helpers.verifyToken(req, 'TEST-SECRET');
        expect(result).not.to.be.undefined;
        expect(result.username).to.equal('berni');
    });

    it('soll einen User speichern und eine Email schicken', function () {
        var user = {
            save: function (cb) {
                user.saved = true;
                return cb();
            },
            saved: false
        };

        var email = {
            mail: function () {
                email.sent = true
            },
            sent: false
        };

        helpers.saveUserAndSendMail(user, {}, email.mail);
        expect(user.saved).to.be.true;
        expect(email.sent).to.be.true;
    });

    describe('soll die Route-Konfiguration laden', function () {
        var routes = {
            'test/route/all': {
                'AUTH': ['test', 'test2'],
                'PARAMS': ['test', 'test2']
            },
            'test/route/all/string': {
                'AUTH': 'test test2',
                'PARAMS': 'test test2'
            },
            'test/route/method': {
                'AUTH': {
                    'GET': ['test', 'test2'],
                    'PUT': 'test test2'
                },
                'PARAMS': {
                    'GET': ['test', 'test2'],
                    'PUT': 'test test2'
                }
            }
        };
        var data = ['test', 'test2'];

        it('soll einen AUTH-Rolle laden', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'GET', 'AUTH');
            expect(result).to.deep.equal(data);
        });

        it('soll eine benötigten Request PARAMS laden', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'GET', 'PARAMS');
            expect(result).to.deep.equal(data);
        });

        it('soll ein Array verwalten können', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/all', 'GET', 'AUTH');
            expect(result).to.deep.equal(data);
        });

        it('soll einen String verwalten können', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/all/string', 'GET', 'AUTH');
            expect(result).to.deep.equal(data);
        });

        it('soll einzelne Methoden verwalten', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'PUT', 'PARAMS');
            expect(result).to.deep.equal(data);
        });

        it('soll bei einer falschen Methode ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'POST', 'AUTH');
            expect(result).to.deep.equal([]);
        });

        it('soll bei einer falschen Route ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/false', 'GET', 'AUTH');
            expect(result).to.deep.equal([]);
        });

        it('soll bei einem falschen KEY ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'GET', 'WRONG');
            expect(result).to.deep.equal([]);
        });

        it('soll einn zusätzlichen String am Ende des Pfads handlen', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method/', 'GET', 'AUTH');
            expect(result).to.deep.equal(data);
        });
    });

    it('soll ein neues Entity speichern', function () {
        var data = undefined;
        var model = function (body) {
            data = body;
            return {
                save: function (cb) {
                    return cb(null, body);
                }
            }
        };
        var req = {
            body: {
                data: '123'
            }
        };

        var res = {
            json: function (data) {
                res.data = data;
            },
            status: function (statusCode) {
                res.statusCode = statusCode;
                return {
                    json: res.json
                }
            },
            data: undefined,
            statusCode: undefined
        };

        helpers.addEntity(model, req, res);
        expect(data).to.equal(req.body);
        expect(res.statusCode).to.equal(200);
        expect(res.data).to.equal(req.body);
    });

    describe('soll den Spielplan auf Korrektheit prüfen', function () {
        it('soll wenn kein Team doppelt vorkommt, true zurückgeben', function () {
            var spiele = [{
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '2'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '5'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '2'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '5'
                }
            }];
            expect(helpers.checkSpielOrderChangeAllowed(spiele)).to.equal(-1);
        });

        it('soll bei doppelten Teams false zurückgeben', function () {
            var spiele = [{
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '2'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '2'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '5'
                }
            }];
            expect(helpers.checkSpielOrderChangeAllowed(spiele)).to.be.above(-1);
        });

        it('soll auch mit leeren Spielen zurechtkommen', function () {
            var spiele = [{
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '2'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '5'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '6'
                }
            }, {}, {}];
            expect(helpers.checkSpielOrderChangeAllowed(spiele)).to.equal(-1);
        });

        it('soll den korrekten Index des Fehlers zurückgeben', function () {
            var spiele = [{
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '2'
                }
            }, {
                teamA: {
                    _id: '3'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '5'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '6'
                }
            }, {
                teamA: {
                    _id: '2'
                },
                teamB: {
                    _id: '4'
                }
            }, {
                teamA: {
                    _id: '1'
                },
                teamB: {
                    _id: '5'
                }
            }];
            expect(helpers.checkSpielOrderChangeAllowed(spiele)).to.be.equal(3);
        })
    });
});

