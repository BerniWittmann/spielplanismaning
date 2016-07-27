(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Spieletabelle', function () {
        beforeEach(module('spi.spieletabelle.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var spiele = [{
            "_id": {
                "$oid": "5795079dfebe4a03004bfe2a"
            },
            "nummer": 1,
            "platz": 1,
            "uhrzeit": "09:00",
            "gruppe": {
                "$oid": "5795053d25126d0300d95521"
            },
            "jugend": {
                "$oid": "5795053d25126d0300d95520"
            },
            "teamA": {
                "$oid": "5795054f25126d0300d95525"
            },
            "teamB": {
                "$oid": "5795054c25126d0300d95524"
            },
            "beendet": false,
            "unentschieden": false,
            "punkteB": 0,
            "punkteA": 0,
            "toreB": 0,
            "toreA": 0,
            "__v": 0
        },
            {
                "_id": {
                    "$oid": "5795079dfebe4a03004bfe2b"
                },
                "nummer": 2,
                "platz": 2,
                "uhrzeit": "09:00",
                "gruppe": {
                    "$oid": "5795053d25126d0300d95521"
                },
                "jugend": {
                    "$oid": "5795053d25126d0300d95520"
                },
                "teamA": {
                    "$oid": "5795054f25126d0300d95525"
                },
                "teamB": {
                    "$oid": "5795054c25126d0300d95524"
                },
                "beendet": false,
                "unentschieden": false,
                "punkteB": 0,
                "punkteA": 0,
                "toreB": 0,
                "toreA": 0,
                "__v": 0
            },
            {
                "_id": {
                    "$oid": "5795079dfebe4a03004bfe2c"
                },
                "nummer": 3,
                "platz": 3,
                "uhrzeit": "09:00",
                "gruppe": {
                    "_id": "5795053d25126d0300d95521",
                    "name": "Test Gruppe"
                },
                "jugend": {
                    "_id": "5795053d25126d0300d95521",
                    "name": "Test Jugend",
                    "color": "gelb"
                },
                "teamA": {
                    "_id": "5795054f25126d0300d95525",
                    "name": "Test Team 1"
                },
                "teamB": {
                    "_id": "5795054c25126d0300d95524",
                    "name": "Test Team 2"
                },
                "beendet": true,
                "unentschieden": false,
                "punkteB": 0,
                "punkteA": 2,
                "toreB": 1,
                "toreA": 3,
                "__v": 0
            }];
        var highlightedTeam = {};
        var $provide;
        var stateMock = {
            go: function () {
            }
        };

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            scope.spiele = spiele;
            scope.highlightedTeam = highlightedTeam;
            $provide.service('$state', function () {
                return stateMock;
            });
            element = $compile('<spi-spiele-tabelle data-spiele="spiele" data-highlightedTeam="highlightedTeam"></spi-spiele-tabelle>')(scope);
            scope.$digest();
            controller = element.controller("spiSpieleTabelle");
        }));

        it('Die Spiele werden geladen', function () {
            var result = element.find('tbody').find('tr');

            expect(result.length).to.be.equal(3);
        });

        it('Die Ergebnisse der Spiele werden geladen', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[6]);

            expect(result.text()).to.contain('3 : 1');
        });

        it('Die Daten der Teams werden geladen', function () {
            var result = angular.element(element.find('tbody').find('tr')[2]).find('td');

            expect(angular.element(result[0]).text()).to.be.equal('09:00');
            expect(angular.element(result[1]).text()).to.be.equal('3');
            expect(angular.element(result[2]).scope().spiel.jugend._id).to.be.equal('5795053d25126d0300d95521');
            expect(angular.element(result[2]).scope().spiel.jugend.name).to.be.equal('Test Jugend');
            expect(angular.element(result[3]).text()).to.be.equal('Test Gruppe');
            expect(angular.element(result[4]).text()).to.contain('Test Team 1');
            expect(angular.element(result[5]).text()).to.contain('Test Team 2'); 
        });

        it('Bei Klick auf ein Spiel wird man zum Spiel weitergeleitet');

        it('Bei Klick auf Team A wird man zum Team weitergeleitet');

        it('Bei Klick auf Team B wird man zum Team weitergeleitet');

        it('Bei Klick auf die Gruppe wird man zur Gruppe weitergeleitet');

        it('Bei Klick auf die Jugend wird man zur Gruppe weitergeleitet');

        it('Bei Klick auf den Platz wird man zum Platz weitergeleitet');
    });
}());
