var expect = require('chai').expect;
var _ = require('lodash');
var server = require('../testserver.js')();
var cls = require('../../../src/config/cls.js');

var mongoose = require('mongoose');
var Spiel = mongoose.model('Spiel');

var importer = require('../../../src/routes/spielImporter/importer.js');
var importSpiele = importer.importSpiele;

describe('Spiel - Import', function () {
    describe('Importer', function () {
        var spieleDefault = [{
            nummer: 1,
            datum: '01.01.1970',
            uhrzeit: '09:30',
            platz: 1,
            turnier: 'jugend',
            gruppe: 'gruppe-a',
            teamA: 'team-1',
            teamALabel: 'Label Team A',
            teamB: 'team-2',
            teamBLabel: 'Label Team B',
            spielLabel: 'Halbfinale',
            toreA: 1,
            toreB: 2,
            punkteA: 1,
            punkteB: 2
        }];
        var spiele;

        before(function (done) {
            server.connectDB(done);
        });

        var check = function (cb) {
            return importSpiele(spiele, cb);
        };

        var beachEventID;
        var clsSession;
        beforeEach(function () {
            spiele = _.cloneDeep(spieleDefault);
            beachEventID = server.IDs.veranstaltung;
            clsSession = cls.getNamespace();
        });

        it('bei ungültigen Spielen soll ein Fehler geworfen werden', function (done) {
            spiele.push(undefined);
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal('[Spiel 2: Validation - Error] Spiel is empty');
                    expect(res).not.to.be.true;

                    return done();
                });
            });
        });

        it('bei gültigen Spielen, sollen die neuen Spiele importiert werden', function (done) {
            return clsSession.run(function () {
                clsSession.set('beachEventID', beachEventID);
                return check(function (err) {
                    expect(err).not.to.exist;

                    return Spiel.find({veranstaltung: beachEventID}, function (err, res) {
                        expect(err).not.to.exist;

                        console.warn(res);

                        return done();
                    });
                });
            });
        });

        after(function (done) {
            server.disconnectDB(done);
        });
    });
});
