var expect = require('chai').expect;
var _ = require('lodash');
var helpers = require('../../src/routes/helpers.js')();

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

    it('soll einem Entity ein Team hinzufügen');

    it('soll ein Entity anhand eines Parameters enfernen');

    describe('soll den letzten Slash bei einem Pfad entfernen können', function () {
        it('wenn der Pfad einen Slash am Ende hat, soll er abgeschnitten werden');

        it('wenn der Pfad keinen Slash am Ende hat, soll er unverändert bleiben');
    });

    it('soll einen Token validieren');

    it('soll einen User speichern und eine Email schicken');
});

