(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Spiel', function () {
        var URL = '/spiel';
        var STATE_NAME = 'spi.event.spiel';

        var spiel = {
            _id: '1',
            platz: 1,
            nummer: 1,
            beendet: true,
            uhrzeit: '09:00',
            jugend: {
                _id: 'jgd1',
                name: 'Jugend 1'
            },
            gruppe: {
                jugend: 'jgd1',
                _id: 'grp1',
                name: 'Gruppe 1'
            },
            teamA: {
                _id: 't1',
                name: 'Team A'
            },
            teamB: {
                _id: 't2',
                name: 'Team B'
            },
            toreA: 8,
            toreB: 3,
            unentschieden: false,
            gewinner: {
                _id: 't1',
                name: 'Team A'
            }
        };
        var mockSpiel;
        var mockState = {
            go: function () {
            }
        };
        var mockStateParams = {
            spielid: '1'
        };
        var mockAuth = {
            isAdmin: function () {
                return true;
            },
            isBearbeiter: function () {
                return false;
            }
        };
        var mockToastr = {
            warning: function () {}
        };
        var injector;
        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.event', {abstract: true});
        }, 'spi.templates.spiel.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiel);
            $provide.value('Logger', {});
            $provide.value('aktivesEvent', {});
        }));

        function compileRouteTemplateWithController($injector, state) {
            $rootScope = $injector.get('$rootScope');
            var $templateCache = $injector.get('$templateCache');
            var $compile = $injector.get('$compile');
            $state = $injector.get('$state');

            var $controller = $injector.get('$controller');
            var scope = $rootScope.$new();
            var stateDetails = $state.get(state);
            var html = $templateCache.get(stateDetails.templateUrl);
            var $q = $injector.get('$q');
            injector = $injector;
            mockSpiel = {
                get: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiel);
                    return deferred.promise;
                },
                getGruppeDisplay: function (spiel) {
                    return spiel.gruppe.name;
                },
                getTeamDisplay: function (spiel, letter) {
                    return spiel['team' + letter].name;
                },
                getBySlugOrID: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiel);
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('SpielController', {
                aktivesSpiel: spiel,
                $state: mockState,
                $stateParams: mockStateParams,
                spielModus: 'normal',
                auth: mockAuth,
                toastr: mockToastr,
                spiel: mockSpiel
            });
            $rootScope.$digest();
            var compileFn = $compile(angular.element('<div></div>').html(html));

            return {
                controller: ctrl,
                scope: scope,
                render: function () {
                    var element = compileFn(scope);
                    $rootScope.$digest();
                    return element;
                }
            };
        }

        var element, render, ctrl, scope, $state, $rootScope, $controller;

        beforeEach(inject(function ($injector) {
            // Call the helper function that "creates" a page.
            // This just creates references to the attributes
            // on the returned object for use in this suite.
            var routeDetails = compileRouteTemplateWithController($injector, STATE_NAME);
            ctrl = routeDetails.controller;
            scope = routeDetails.scope;

            render = function () {
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL + '/');
        });

        describe('Resolves', function () {
            it('soll das Spiel resolven', function () {
                var promise = resolve('aktivesSpiel').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiel);
            });
        });

        it('soll die Spiel-Nummer anzeigen', function () {
            render();
            var result = angular.element(element.find('h3')[0]);
            expect(result.text()).to.contain('Spiel #1');
        });

        it('soll die Uhrzeit anzeigen', function () {
            render();
            expect(element.find('#spiel-uhrzeit').text()).to.contain('09:00 Uhr');
        });

        it('soll das Team A laden', function () {
            render();
            expect(element.find('#spiel-teamA').text()).to.contain('Team A');
        });

        it('Bei Klick auf Team A soll man zur Teamseite navigiert werden', function () {
            render();
            var spy = chai.spy.on(mockState, 'go');

            element.find('#spiel-teamA').triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.event.tgj.team', {teamid: 't1'});
        });

        it('soll das Team B laden', function () {
            render();
            expect(element.find('#spiel-teamB').text()).to.contain('Team B');
        });

        it('Bei Klick auf Team B soll man zur Teamseite navigiert werden', function () {
            render();
            var spy = chai.spy.on(mockState, 'go');

            element.find('#spiel-teamB').triggerHandler('click');

            expect(spy).to.have.been.called.with('spi.event.tgj.team', {teamid: 't2'});
        });

        it('soll den Spielstand anzeigen', function () {
            render();
            expect(element.find('#spiel-stand').text()).to.contain('8 : 3');
        });

        it('soll das Ergebnis anzeigen', function () {
            render();
            expect(element.find('#spiel-unentschieden')).not.to.exist;
            expect(element.find('#spiel-gewinner')).to.exist;
            expect(element.find('#spiel-gewinner')).to.contain('Team A hat gewonnen');
        });

        describe('Das Spiel ist Unentschieden ausgegangen', function () {
            before(function () {
                spiel.unentschieden = true;
                spiel.gewinner = undefined;
            });

            it('soll das Ergebnis anzeigen', function () {
                render();
                expect(element.find('#spiel-unentschieden')).to.exist;
                expect(element.find('#spiel-unentschieden')).to.contain('Unentschieden');
                expect(element.find('#spiel-gewinner')).not.to.exist;
            });
        });
    });
}());