(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Alle Spiele Druck', function () {
        var URL = '/spiele-druck';
        var STATE_NAME = 'spi.event.verwaltung.spiele-druck';

        var spiele = [{
            _id:'s1',
            nummer: 1,
            uhrzeit: '09:00',
            teamA: {
                _id: 't1',
                name: 'Team 1'
            },
            teamB: {
                _id: 't2',
                name: 'Team 2'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }, {
            _id:'s2',
            nummer: 2,
            uhrzeit: '09:10',
            teamA: {
                _id: 't2',
                name: 'Team 2'
            },
            teamB: {
                _id: 't3',
                name: 'Team 3'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }, {
            _id:'s3',
            nummer: 3,
            uhrzeit: '09:20',
            teamA: {
                _id: 't3',
                name: 'Team 3'
            },
            teamB: {
                _id: 't1',
                name: 'Team 1'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }];
        var mockState = {
            go: function () {
            }
        };
        var injector;
        var mockSpiele;
        var mockScope = {
            $watch: function () {}
        };

        function resolve(value) {
            return {
                forStateAndView: function (state, view) {
                    var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                    var res = viewDefinition.resolve[value];
                    $rootScope.$digest();
                    return injector.invoke(res);
                }
            };
        }

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.event', {abstract: true});
            $stateProvider.state('spi.event.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.spiele-druck.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiele);
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
            $httpBackend = $injector.get('$httpBackend');
            injector = $injector;
            mockSpiele = {
                getAll: function () {
                    return $q.when(spiele);
                },
                getGruppeDisplay: function (spiel) {
                    return spiel.gruppe.name;
                },
                getTeamDisplay: function (spiel, letter) {
                    return spiel['team' + letter].name;
                }
            };

            var ctrl = scope.vm = $controller('SpieleDruckController', {
                spiele: spiele,
                $state: mockState,
                $scope: mockScope,
                mannschaftslisten: 'false'
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
            it('soll die Spiele resolven', function () {
                var promise = resolve('spiele').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        it('es werden die Spiele angezeigt', function () {
            render();
            var result = element.find('.spiel-time');
            expect(result).to.have.lengthOf(3);
            expect(angular.element(result[0]).text()).to.contain('09:20 Uhr');
            expect(angular.element(result[1]).text()).to.contain('09:10 Uhr');
            expect(angular.element(result[2]).text()).to.contain('09:00 Uhr');
            expect(ctrl.spiele).to.have.lengthOf(3);
        });

        it('Beim Klick auf die Gruppe wird man zur Gruppe navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-gruppe')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({gruppeid: 'g1'});
        });

        it('Beim Klick auf die Team A wird man zum Team A navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-teamA')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({teamid: 't3'});
        });

        it('Beim Klick auf die Team B wird man zu Team B navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-teamB')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({teamid: 't1'});
        });

    });
}());