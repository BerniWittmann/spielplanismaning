var expect = require('chai').expect;
var _ = require('lodash');
var server = require('../testserver.js')();
var cls = require('../../../src/config/cls.js');

var validator = require('../../../src/routes/spielImporter/validator/validator');
var validate = validator.validateSpiel;

describe('Spiel - Import - Validator', function () {
    var index = 0;
    var defaultSpiel = {
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
    };
    var spiel;
    var check = function (cb) {
        return validate(spiel, index, cb);
    };

    before(function (done) {
        server.connectDB(done);
    });

    var beachEventID;
    var clsSession;
    beforeEach(function () {
        spiel = _.cloneDeep(defaultSpiel);
        beachEventID = server.IDs.veranstaltung;
        clsSession = cls.getNamespace();
    });

    var validationErrorPrefix = '[Spiel ' + index + ': Validation - Error] ';
    it('soll einen Fehler bei einem undefined Spiel liefern', function (done) {
        validate(undefined, index, function (err, res) {
            expect(err).to.be.defined;
            expect(err).to.equal(validationErrorPrefix + 'Spiel is empty');
            expect(res).to.be.false;

            return done();
        });
    });

    describe('soll die Felder validieren', function () {
        describe('die Nummer soll validiert werden', function () {
            it('die Nummer ist required', function (done) {
                delete spiel.nummer;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "nummer" is required');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('die Nummer muss ein Integer sein', function (done) {
                spiel.nummer = 'foo';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "nummer" must be a number');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('die Nummer muss größer 0 sein', function (done) {
                spiel.nummer = 0;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "nummer" must be larger than or equal to 1');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('Soll das Datum validieren', function () {
            it('Das Datum ist required', function (done) {
                delete spiel.datum;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "datum" is required');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('Das Datum muss im richtigen Format sein', function (done) {
                spiel.datum = '2017-01-01';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "datum" must be a string with one of the following formats [DD.MM.YYYY]');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('Das Datum muss gültig sein', function (done) {
                spiel.datum = '31.02.1990';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "datum" must be a string with one of the following formats [DD.MM.YYYY]');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('Soll die Uhrzeit validieren', function () {
            it('Die Uhrzeit ist required', function (done) {
                delete spiel.uhrzeit;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "uhrzeit" is required');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('Die Uhrzeit muss im richtigen Format sein', function (done) {
                spiel.uhrzeit = '07:30 AM';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "uhrzeit" must be a string with one of the following formats [HH:mm]');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('Die Uhrzeit muss gültig sein', function (done) {
                spiel.uhrzeit = '48:30';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "uhrzeit" must be a string with one of the following formats [HH:mm]');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('der Platz soll validiert werden', function () {
            it('der Platz ist required', function (done) {
                delete spiel.platz;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "platz" is required');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('dder Platz muss ein Integer sein', function (done) {
                spiel.platz = 'foo';
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "platz" must be a number');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('der Platz muss größer 0 sein', function (done) {
                spiel.platz = 0;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "platz" must be larger than or equal to 1');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('der Platz darf nicht größer als die Platzanzahl sein', function (done) {
                spiel.platz = 5;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "platz" must be less than or equal to 3');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('das Turnier soll validiert werden', function () {
            it('das Turnier ist required', function (done) {
                delete spiel.turnier;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "turnier" is required');
                    expect(res).to.be.false;

                    return done();
                });
            });

            it('das Turnier muss ein String sein', function (done) {
                spiel.turnier = 42;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "turnier" must be a string');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('die Gruppe soll validiert werden', function () {
            it('die Gruppe muss ein String sein', function (done) {
                spiel.gruppe = 42;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "gruppe" must be a string');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('das Spiellabel soll validiert werden', function () {
            it('das Spiellabel muss ein String sein', function (done) {
                spiel.spielLabel = 42;
                check(function (err, res) {
                    expect(err).to.be.defined;
                    expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "spielLabel" must be a string');
                    expect(res).to.be.false;

                    return done();
                });
            });
        });

        describe('Gruppe oder Spiellabel müssen required sein', function () {
           it('mindestens eins von beiden muss gegeben sein', function (done) {
               delete spiel.gruppe;
               delete spiel.spielLabel;
               check(function (err, res) {
                   expect(err).to.be.defined;
                   expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "value" must contain at least one of [gruppe, spielLabel]');
                   expect(res).to.be.false;

                   return done();
               });
           });
        });

        _.forEach(['A', 'B'], function (letter) {
            describe('das Team' + letter + ' soll validiert werden', function () {
                it('das Team muss ein String sein', function (done) {
                    spiel['team' + letter] = 42;
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "team' + letter + '" must be a string');
                        expect(res).to.be.false;

                        return done();
                    });
                });
            });

            describe('das Team' + letter + 'Label soll validiert werden', function () {
                it('das TeamLabel muss ein String sein', function (done) {
                    spiel['team' + letter + 'Label'] = 42;
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "team' + letter + 'Label" must be a string');
                        expect(res).to.be.false;

                        return done();
                    });
                });
            });

            describe('das Team' + letter + ' und das TeamLabel sollen required sein', function () {
                it('mindestens eines von beiden muss gegeben sein', function (done) {
                    delete spiel['team' + letter + 'Label'];
                    delete spiel['team' + letter];
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "value" must contain at least one of [team' + letter + ', team' + letter + 'Label]');
                        expect(res).to.be.false;

                        return done();
                    });
                });
            });
        });

        _.forEach(['toreA', 'toreB', 'punkteA', 'punkteB'], function (key) {
            describe(key + ' soll validiert werden', function () {
                it(key + ' ist required', function (done) {
                    delete spiel[key];
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "' + key + '" is required');
                        expect(res).to.be.false;

                        return done();
                    });
                });

                it(key + ' muss ein Integer sein', function (done) {
                    spiel[key] = 'foo';
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "' + key + '" must be a number');
                        expect(res).to.be.false;

                        return done();
                    });
                });

                it(key + ' muss größer gleich 0 sein', function (done) {
                    spiel[key] = -1;
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Fields invalid: "' + key + '" must be larger than or equal to 0');
                        expect(res).to.be.false;

                        return done();
                    });
                });
            });
        });
    });

    describe('die Entities sollen auf Existenz geprüft werden', function () {
        _.forEach(['turnier', 'gruppe', 'teamA', 'teamB'], function (key) {
            it('wenn das ' + key + ' nicht gefunden wird, soll ein Fehler gemeldet werden', function (done) {
                spiel[key] = 'invalid-slug';
                return clsSession.run(function () {
                    clsSession.set('beachEventID', beachEventID);
                    check(function (err, res) {
                        expect(err).to.be.defined;
                        expect(err).to.equal(validationErrorPrefix + 'Entity ' + key + ' with slug invalid-slug not found');
                        expect(res).to.be.false;

                        return done();
                    });
                });
            });
        });
    });

    after(function (done) {
        server.disconnectDB(done);
    });
});
