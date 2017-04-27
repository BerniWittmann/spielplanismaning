(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Spieletabelle', function () {
        beforeEach(module('spi.components.spieletabelle.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var spiele = [{
            "_id": "5795079dfebe4a03004bfe2a",
            "nummer": 1,
            "platz": 1,
            "datum": '01.01.1970',
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
                "_id": "5795079dfebe4a03004bfe2b",
                "nummer": 2,
                "platz": 2,
                "datum": '01.01.1970',
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
                "_id": "5795079dfebe4a03004bfe2c",
                "nummer": 3,
                "platz": 3,
                "datum": '01.01.1970',
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
        var highlightedTeam = {
            "_id": "5795054f25126d0300d95525",
            "name": "Test Team 1"
        };
        var $provide;
        var stateMock = {
            go: function () {
            }
        };

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));

        beforeEach(inject(function ($rootScope, $compile, $httpBackend) {
            scope = $rootScope.$new();
            scope.spiele = spiele;
            scope.highlightedTeam = highlightedTeam;
            $provide.service('$state', function () {
                return stateMock;
            });
            $provide.service('Logger', function () {
                return {
                    log: function () {}
                };
            });
            $httpBackend.expectGET('/api/teams').respond(201, [{_id: '1', name: 'team 1'}, {_id: '2', name: 'team 2'}]);
            element = $compile('<spi-spiele-tabelle data-spiele="spiele" data-highlighted-team="highlightedTeam"></spi-spiele-tabelle>')(scope);
            scope.$digest();
            controller = element.controller("spiSpieleTabelle");
        }));

        it('Die Spiele werden geladen', function () {
            var result = element.find('tbody').find('tr');

            expect(result.length).to.be.equal(3);
        });

        it('Die Ergebnisse der Spiele werden geladen', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[7]);

            expect(result.text()).to.contain('3 : 1');
        });

        it('Die Daten der Teams werden geladen', function () {
            var result = angular.element(element.find('tbody').find('tr')[2]).find('td');

            expect(angular.element(result[0]).text()).to.be.equal('01.01.1970');
            expect(angular.element(result[1]).text()).to.be.equal('09:00');
            expect(angular.element(result[2]).text()).to.be.equal('3');
            expect(angular.element(result[3]).scope().spiel.jugend._id).to.be.equal('5795053d25126d0300d95521');
            expect(angular.element(result[3]).scope().spiel.jugend.name).to.be.equal('Test Jugend');
            expect(angular.element(result[4]).text()).to.be.equal('Test Gruppe');
            expect(angular.element(result[5]).text()).to.contain('Test Team 1');
            expect(angular.element(result[6]).text()).to.contain('Test Team 2');
        });

        it('Bei Klick auf ein Spiel wird man zum Spiel weitergeleitet', function () {
            var result = angular.element(element.find('tbody').find('tr')[2]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.spiel', {
                spielid: '5795079dfebe4a03004bfe2c'
            });
        });

        it('Bei Klick auf Team A wird man zum Team weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[5]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.team', {
                teamid: '5795054f25126d0300d95525'
            });
        });

        it('Bei Klick auf Team B wird man zum Team weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[6]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.team', {
                teamid: '5795054c25126d0300d95524'
            });
        });

        it('Bei Klick auf die Gruppe wird man zur Gruppe weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[4]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.gruppe', {
                gruppeid: '5795053d25126d0300d95521'
            });
        });

        it('Bei Klick auf die Jugend wird man zur Gruppe weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[3]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.jugend', {
                jugendid: '5795053d25126d0300d95521'
            });
        });

        it('Bei Klick auf den Platz wird man zum Platz weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[2]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.platz', {
                platznummer: '3'
            });
        });

        it('Bei Klick auf das Datum wird man zum Datum weitergeleitet', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[0]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.datum', {
                datum: '1970-01-01'
            });
        });

        it('das ausgewählt Team wird gehighlited', function () {
            var result = angular.element(angular.element(element.find('tbody').find('tr')[2]).find('td')[5]);

            expect(result.hasClass('highlightTeamName')).to.be.true;
        });
    });
}());
