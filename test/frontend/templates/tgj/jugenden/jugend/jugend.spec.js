(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Jugend', function () {
        var URL = '/turniere/';
        var STATE_NAME = 'spi.event.tgj.jugend';

        var jugend = {
            _id: '1',
            name: 'Jugend 1',
            gruppen: [{
                name: 'Gruppe 1',
                _id: 'g1'
            }, {
                name: 'Gruppe 2',
                _id: 'g2'
            }], teams: [{
                name: 'Team 1',
                _id: 't1'
            }, {
                name: 'Team 2',
                _id: 't2'
            }, {
                name: 'Team 3',
                _id: 't3'
            }]
        };
        var spiele = [{
            nummer: 1,
            uhrzeit: '09:00',
            teamA: 't1',
            teamB: 't2'
        }, {
            nummer: 2,
            uhrzeit: '09:10',
            teamA: 't2',
            teamB: 't3'
        }, {
            nummer: 3,
            uhrzeit: '09:20',
            teamA: 't3',
            teamB: 't1'
        }];
        var gruppen = [{
            name: 'Gruppe 1',
            _id: 'g1',
            teamTabelle: jugend.teams
        }, {
            name: 'Gruppe 2',
            _id: 'g2',
            teamTabelle: jugend.teams
        }];
        var injector;
        var mockJugend;
        var mockSpiele;
        var mockGruppe;

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
            $stateProvider.state('spi.event.tgj', {abstract: true});
        }, 'spi.templates.tgj.jugend.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('jugend', mockJugend);
            $provide.value('spiel', mockSpiele);
            $provide.value('aktiveJugend', jugend);
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
            $httpBackend = $injector.get('$httpBackend');

            mockJugend = {
                get: function () {
                    return $q.when(jugend);
                },
                getBySlugOrID: function () {
                    return $q.when(jugend);
                }
            };

            mockSpiele = {
                getByJugend: function () {
                    return $q.when(spiele);
                }
            };

            mockGruppe = {
                getByJugend: function () {
                    return $q.when(gruppen);
                }
            };

            var ctrl = scope.vm = $controller('JugendController', {
                aktiveJugend: jugend,
                spiele: spiele,
                gruppen: gruppen
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

        var element, render, ctrl, scope, $state, $rootScope, $controller, $httpBackend;

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
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        describe('Resolves', function () {
            it('soll die Jugend resolven', function () {
                var promise = resolve('aktiveJugend').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(jugend);
            });

            it('soll die Spiele resolven', function () {
                var promise = resolve('spiele').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        it('soll den Jugendnamen anzeigen', function () {
            render();
            expect(element.find('h3 > spi-jugend-label')).to.exist;
            expect(ctrl.jugend.name).to.be.equal('Jugend 1');
        });

        it('soll die Spiele anzeigen', function () {
            render();
            expect(element.find('spi-spiele-tabelle')).to.exist;
            expect(ctrl.spiele).to.have.lengthOf(3);
        });

        it('soll die Gruppen der Jugend laden', function () {
            render();
            expect(element.find('spi-panel')).to.have.lengthOf(2);
            var result = element.find('spi-panel-titel > a');
            expect(angular.element(result[0]).text()).to.contain('Gruppe 1');
            expect(angular.element(result[1]).text()).to.contain('Gruppe 2');
        });
    });
}());