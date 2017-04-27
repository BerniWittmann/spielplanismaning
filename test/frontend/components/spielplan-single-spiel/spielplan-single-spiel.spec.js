(function () {
    'use strict';

    var expect = chai.expect;

    describe('Component: Spielplan Single Spiel', function () {
        beforeEach(module('spi.components.spielplan.singlespiel.ui'));
        beforeEach(module('htmlModule'));
        var element;
        var scope;
        var controller;
        var spiel = {
            "_id": "5795079dfebe4a03004bfe2a",
            "nummer": 1,
            "platz": 1,
            "datum": "01.01.1970",
            "uhrzeit": "09:00",
            "gruppe": {
                "_id": "5795053d25126d0300d95521",
                "name": "Test Gruppe"
            },
            "jugend": {
                "_id": "5795053d25126d0300d95520",
                "name": "Test Jugend"
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
            "punkteA": 0,
            "toreB": 0,
            "toreA": 0,
            "__v": 0
        };
        var $provide;
        var stateMock = {
            go: function () {
            }
        };
        var showGruppe = true;
        var showJugend = true;

        var authMock = {
            access: false,
            canAccess: function () {
                return authMock.access;
            },
            isAdmin: function () {
                return authMock.access;
            },
            isBearbeiter: function () {
                return authMock.access;
            }
        };
        var mockBestaetigenDialog = {
            open: function (text, fnct) {
                fnct();
            }
        };

        beforeEach(module(function (_$provide_) {
            $provide = _$provide_;
        }));
        var mockSpiel;

        beforeEach(inject(function ($rootScope, $compile, $q) {
            scope = $rootScope.$new();
            scope.spiel = spiel;
            scope.showJugend = showJugend;
            scope.showGruppe = showGruppe;
            $provide.service('$state', function () {
                return stateMock;
            });
            $provide.service('auth', function () {
                return authMock;
            });
            $provide.service('BestaetigenDialog', function () {
                return mockBestaetigenDialog;
            });
            $provide.service('spiel', function () {
                mockSpiel = {
                    resetSpiel: function (spiel) {
                        return $q.when(spiel);
                    },
                    updateTore: function (spiel) {
                        return $q.when(spiel);
                    },
                    getGruppeDisplay: function (spiel) {
                        return spiel.gruppe.name;
                    },
                    getTeamDisplay: function (spiel, letter) {
                        return spiel['team' + letter];
                    }
                };
                return mockSpiel;
            });
            element = $compile('<table><tr data-spi-single-spiel="spiel" data-show-jugend="showJugend" data-show-gruppe="showGruppe"></tr></table>')(scope);
            scope.$digest();
            controller = element.controller("SpielplanSingleSpielController");
            compile = $compile;
        }));

        var compile;

        function recompile() {
            scope.showJugend = showJugend;
            scope.showGruppe = showGruppe;
            element = compile('<table><tr data-spi-single-spiel="spiel" data-show-jugend="showJugend" data-show-gruppe="showGruppe"></tr></table>')(scope);
        }

        it('Das Spiel wird geladen', function () {
            var result = element.find('tr').find('td');

            expect(angular.element(result[0]).text()).to.be.equal('1');
            expect(angular.element(result[1]).text()).to.be.equal('01.01.1970');
            expect(angular.element(result[2]).text()).to.be.equal('09:00');
            expect(angular.element(result[3]).text()).to.be.equal('1');
            expect(angular.element(result[4]).scope().vm.spiel.jugend._id).to.be.equal('5795053d25126d0300d95520');
            expect(angular.element(result[4]).scope().vm.spiel.jugend.name).to.be.equal('Test Jugend');
            expect(angular.element(result[5]).text()).to.be.equal('Test Gruppe');
            expect(angular.element(result[6]).text()).to.contain('Test Team 1');
            expect(angular.element(result[7]).text()).to.contain('Test Team 2');
        });

        it('Das Ergebnis wird geladen', function () {
            var result = angular.element(element.find('tr').find('td')[8]);

            expect(result.text()).to.contain('0 : 0');
        });

        describe('Angenommen der Nutzer ist nicht angemeldet', function () {
            beforeEach(function () {
                authMock.access = false;
                showGruppe = true;
                showJugend = true;
                recompile();
                scope.$apply();
            });

            it('Es wird kein Bearbeiten Button angezeigt', function () {
                var spans = angular.element(element.find('tr').find('td')[8]).find('span');

                var result = false;
                _.forEach(spans, function (span) {
                    span = angular.element(span);
                    if (span.find('i').length > 0 && angular.element(span.find('i')).hasClass('fa-pencil')) {
                        result = true;
                    }
                });

                expect(result).to.be.false;
            });
        });

        describe('Angenommen der Nutzer ist angemeldet', function () {
            beforeEach(function () {
                authMock.access = true;
                showGruppe = true;
                showJugend = true;
                recompile();
                scope.$apply();
            });

            it('Es wird ein Bearbeiten Button angezeigt', function () {
                var spans = angular.element(element.find('tr').find('td')[8]).find('span');

                var result = false;
                _.forEach(spans, function (span) {
                    span = angular.element(span);
                    if (span.find('i').length > 0 && angular.element(span.find('i')).hasClass('fa-pencil')) {
                        result = true;
                    }
                });

                expect(result).to.be.true;
            });

            describe('Beim Klick auf den Bearbeiten Button, kann man ein Ergebnis eintragen', function () {
                var el;
                beforeEach(function () {
                    el = angular.element(element.find('tr').find('td')[8]);
                    el.find('i').parent().triggerHandler('click');
                });

                it('Es wird ein Button zum Abbrechen angezeigt', function () {
                    var result = false;

                    _.forEach(el.find('i'), function (i) {
                        i = angular.element(i);

                        if (i.hasClass('fa-remove')) {
                            result = true;
                        }
                    });

                    expect(result).to.be.true;
                });
                it('Es wird ein Button zum Speichern angezeigt', function () {
                    var result = false;

                    _.forEach(el.find('i'), function (i) {
                        i = angular.element(i);

                        if (i.hasClass('fa-check')) {
                            result = true;
                        }
                    });

                    expect(result).to.be.true;
                });
                it('Es wird ein Button zum Zurücksetzen angezeigt', function () {
                    var result = false;

                    _.forEach(el.find('i'), function (i) {
                        i = angular.element(i);

                        if (i.hasClass('fa-trash')) {
                            result = true;
                        }
                    });

                    expect(result).to.be.true;
                });
                it('Es sind Eingabefelder vorhanden', function () {
                    var result = el.find('input');

                    expect(result).to.have.length.of.at.least(2);
                });
                it('Beim Speichern wird das Ergebnis gespeichert', function () {
                    var spy = chai.spy.on(mockSpiel, 'updateTore');

                    el.scope().vm.spiel.toreA = 3;
                    el.scope().vm.spiel.toreB = 4;
                    scope.$apply();
                    el.scope().vm.save();

                    expect(spy).to.have.been.called();
                });
                it('Beim Zurücksetzen wird das bisherige Ergebnis geladen', function () {
                    var spy = chai.spy.on(mockSpiel, 'resetSpiel');

                    el.scope().vm.spiel.toreA = 3;
                    el.scope().vm.spiel.toreB = 4;
                    scope.$apply();
                    el.scope().vm.deleteSpiel();

                    expect(spy).to.have.been.called();
                });
                it('Beim Abbrechen wird das Bearbeiten-Menü verlassen', function () {
                    el.scope().vm.abort();
                    scope.$apply();

                    expect(el.find('i')).to.have.lengthOf(1);
                });
            });
        });

        it('Bei Klick auf Team A wird man zum Team weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[6]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.team', {
                teamid: '5795054f25126d0300d95525'
            });
        });

        it('Bei Klick auf Team B wird man zum Team weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[7]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.team', {
                teamid: '5795054c25126d0300d95524'
            });
        });

        it('Bei Klick auf die Gruppe wird man zur Gruppe weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[5]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.gruppe', {
                gruppeid: '5795053d25126d0300d95521'
            });
        });

        it('Bei Klick auf die Jugend wird man zur Jugend weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[4]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.tgj.jugend', {
                jugendid: '5795053d25126d0300d95520'
            });
        });

        it('Bei Klick auf den Platz wird man zum Platz weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[3]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.platz', {
                platznummer: 1
            });
        });

        it('Bei Klick auf das Datum wird man zum Datum weitergeleitet', function () {
            var result = angular.element(element.find('tr').find('td')[1]);
            var spy = chai.spy.on(stateMock, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.datum', {
                datum: '1970-01-01'
            });
        });

        it('soll die Gruppe ausblenden können', function () {
            showGruppe = false;
            recompile();
            scope.$apply();
            var result = element.find('tr').find('td');

            expect(angular.element(result[5]).text()).not.to.be.equal('Test Gruppe');

            showGruppe = true;
        });

        it('soll die Jugend ausblenden können', function () {
            showJugend = false;
            recompile();
            scope.$apply();
            var result = element.find('tr').find('td');

            expect(angular.element(result[5]).text()).not.to.be.equal('Test Jugend');

            showJugend = true;
        });
    });
}());
