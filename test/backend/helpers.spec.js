var expect = require('chai').expect;
var _ = require('lodash');
var server = require('./testserver.js')();
var helpers = require('../../src/routes/helpers.js');

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
            expect(result).to.deep.equal(data.join(' '));
        });

        it('soll bei einer falschen Methode ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'POST', 'AUTH');
            expect(result).to.be.undefined;
        });

        it('soll bei einer falschen Route ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/false', 'GET', 'AUTH');
            expect(result).to.be.undefined;
        });

        it('soll bei einem falschen KEY ein leeres Array zurückgeben', function () {
            var result = helpers.getRequiredRouteConfig(routes, 'test/route/method', 'GET', 'WRONG');
            expect(result).to.be.undefined;
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

    describe('soll das richtige Datum und Zeit für ein Spiel berechnen', function () {
        var calcSpielDateTime = helpers.calcSpielDateTime;
        var spielplan;

        describe('Eintägiges Event', function () {
            describe('die Spielzeiten passen genau', function () {
                beforeEach(function () {
                    spielplan = {
                        spielzeit: 15,
                        pausenzeit: 5,
                        startzeit: '10:00',
                        endzeit: '11:00',
                        startdatum: '01.01.1970',
                        enddatum: '01.01.1970'
                    };
                });
                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:20');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
            });

            describe('die Spielzeiten passen nicht genau', function () {
                beforeEach(function () {
                    spielplan = {
                        spielzeit: 15,
                        pausenzeit: 3,
                        startzeit: '10:00',
                        endzeit: '11:00',
                        startdatum: '01.01.1970',
                        enddatum: '01.01.1970'
                    };
                });

                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:18');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
            });
        });

        describe('Zweitägiges Event', function () {
            beforeEach(function () {
                spielplan = {
                    spielzeit: 15,
                    pausenzeit: 5,
                    startzeit: '10:00',
                    endzeit: '11:00',
                    startdatum: '01.01.1970',
                    enddatum: '02.01.1970'
                };
            });
            describe('die Spielzeiten passen genau', function () {
                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:20');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am ersten Tag richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(10, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(18, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
            });

            describe('die Spielzeiten passen nicht genau', function () {
                beforeEach(function () {
                    spielplan = {
                        spielzeit: 15,
                        pausenzeit: 3,
                        startzeit: '10:00',
                        endzeit: '11:00',
                        startdatum: '01.01.1970',
                        enddatum: '02.01.1970'
                    };
                });

                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:18');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am ersten Tag richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(10, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(18, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
            });
        });

        describe('Dreitägiges Event', function () {
            beforeEach(function () {
                spielplan = {
                    spielzeit: 15,
                    pausenzeit: 5,
                    startzeit: '10:00',
                    endzeit: '11:00',
                    startdatum: '01.01.1970',
                    enddatum: '03.01.1970'
                };
            });
            describe('die Spielzeiten passen genau', function () {
                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:20');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am ersten Tag richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(10, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(18, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am dritten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(19, spielplan);

                    expect(result.date).to.equal('03.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am dritten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(27, spielplan);

                    expect(result.date).to.equal('03.01.1970');
                    expect(result.time).to.equal('10:40');
                    expect(result.platz).to.equal(3);
                });
            });

            describe('die Spielzeiten passen nicht genau', function () {
                beforeEach(function () {
                    spielplan = {
                        spielzeit: 15,
                        pausenzeit: 3,
                        startzeit: '10:00',
                        endzeit: '11:00',
                        startdatum: '01.01.1970',
                        enddatum: '03.01.1970'
                    };
                });

                it('soll für das erste Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(1, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll für das zweite Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(2, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(2);
                });
                it('soll für das dritte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(3, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(3);
                });
                it('soll für das vierte Spiel richtig berechnen', function () {
                    var result = calcSpielDateTime(4, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:18');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am ersten Tag richtig berechen', function () {
                    var result = calcSpielDateTime(9, spielplan);

                    expect(result.date).to.equal('01.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(10, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am zweiten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(18, spielplan);

                    expect(result.date).to.equal('02.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
                it('soll das erste Spiel am dritten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(19, spielplan);

                    expect(result.date).to.equal('03.01.1970');
                    expect(result.time).to.equal('10:00');
                    expect(result.platz).to.equal(1);
                });
                it('soll das letzte Spiel am dritten Tag richtig berechnen', function () {
                    var result = calcSpielDateTime(27, spielplan);

                    expect(result.date).to.equal('03.01.1970');
                    expect(result.time).to.equal('10:36');
                    expect(result.platz).to.equal(3);
                });
            });
        });
    });

    describe('Platz Tabelle Kalkulation', function () {
        const gruppeFindPlace = helpers.gruppeFindPlace;
        const maxTeams = 4;
        let teams, spiele;

        function checkPlaetze() {
            for (let i = 1; i <= maxTeams; i++) {
                it('Es soll Platz ' + i + ' korrekt geladen werden', function (done) {
                    gruppeFindPlace(teams, spiele, i, {type: 'all', _id: '1234'}, function (err, result) {
                        expect(err).to.equal(null);
                        expect(result._id).to.equal(i.toString());
                        return done();
                    });
                });
            }
        }

        function initTeamsUndSpiele() {
            teams = [
                {
                    _id: '1',
                    ergebnisse: {
                        all: {
                            punkte: 4,
                            gpunkte: 0,
                            tore: 2,
                            gtore: 0
                        }
                    }
                },
                {
                    _id: '2',
                    ergebnisse: {
                        all: {
                            punkte: 2,
                            gpunkte: 2,
                            tore: 2,
                            gtore: 1
                        }
                    }
                }, {
                    _id: '3',
                    ergebnisse: {
                        all: {
                            punkte: 2,
                            gpunkte: 4,
                            tore: 1,
                            gtore: 2
                        }
                    }
                }, {
                    _id: '4',
                    ergebnisse: {
                        all: {
                            punkte: 0,
                            gpunkte: 6,
                            tore: 0,
                            gtore: 3
                        }
                    }
                }];
            spiele = [];
            let nummer = 1;
            for (let a = 1; a < maxTeams; a++) {
                for (let b = 2; b <= maxTeams; b++) {
                    spiele.push({
                        _id: 's' + nummer,
                        teamA: a,
                        teamB: b,
                        beendet: true,
                        unentschieden: false,
                        punkteB: 0,
                        punkteA: 2,
                        toreB: 0,
                        toreA: 1,
                        gewinner: a
                    });
                    nummer++;
                }
            }
        }

        describe('Es sind bereits alle Spiele gespielt', function () {
            beforeEach(function () {
                initTeamsUndSpiele();
            });

            checkPlaetze();
        });

        describe('Es sind noch nicht alle Spiel gespielt', function () {
            beforeEach(function () {
                initTeamsUndSpiele();
                spiele[0].beendet = false
            });

            for (let i = 1; i <= maxTeams; i++) {
                it('Es soll Platz ' + i + ' korrekt geladen werden', function (done) {
                    gruppeFindPlace(teams, spiele, i, {type: 'all', _id: '1234'}, function (err, result) {
                        expect(result).to.be.undefined;
                        return done();
                    });
                });
            }
        });
    })
});

