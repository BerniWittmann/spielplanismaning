(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Gruppe', function () {
        var URL = '/gruppen/';
        var STATE_NAME = 'spi.tgj.gruppe';

        var gruppe = {
            _id: '1',
            name: 'Gruppe 1',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd1'
            }, teams: [{
                name: 'Team 1',
                _id: 't1'
            }, {
                name: 'Team 2',
                _id: 't2'
            }, {
                name: 'Team 3',
                _id: 't3'
            }],
            teamTabelle: [{
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
            datum: '01.01.1970',
            teamA: 't1',
            teamB: 't2'
        }, {
            nummer: 2,
            uhrzeit: '09:10',
            datum: '01.01.1970',
            teamA: 't2',
            teamB: 't3'
        }, {
            nummer: 3,
            uhrzeit: '09:20',
            datum: '01.01.1970',
            teamA: 't3',
            teamB: 't1'
        }];
        var mockSpiel;
        var injector;
        var mockGruppe;
        var mockTeam = {
            getByGruppe: function () {
                return gruppe.teams;
            }
        }
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
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.templates.tgj.gruppe.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiel);
            $provide.value('gruppe', mockGruppe);
            $provide.value('aktiveGruppe', gruppe);
            $provide.value('team', mockTeam);
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
            injector = $injector
            mockSpiel = {
                getByGruppe: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiele);
                    return deferred.promise;
                },
                getGruppeDisplay: function (gruppe) {
                    return 'Gruppe 1';
                },
                getTeamDisplay: function (spiel, letter) {
                    return 'Team ' + spiel['team' + letter];
                }
            };

            mockGruppe = {
                get: function () {
                    return $q.when(gruppe);
                }
            };

            var ctrl = scope.vm = $controller('GruppeController', {
                aktiveGruppe: gruppe,
                spiele: spiele,
                teams: gruppe.teams
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
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        describe('Resolves', function () {
            it('soll die Gruppe resolven', function () {
                var promise = resolve('aktiveGruppe').forStateAndView('spi.tgj.gruppe');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(gruppe);
            });

            it('soll die Spiele der Gruppe resolven', function () {
                var promise = resolve('spiele').forStateAndView('spi.tgj.gruppe');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        it('soll den Gruppennamen anzeigen', function () {
            render();
            console.log(element.find('h3').text())
            expect(element.find('h3').text()).to.contain('Gruppe 1');
        });

        it('soll die Spiele laden', function () {
            render();
            expect(element.find('spi-spiele-tabelle')).to.exist;
            var result = element.find('spi-spiele-tabelle').find('tbody').find('tr');
            expect(result).to.have.lengthOf(3);
            console.log(result);
            expect(angular.element(angular.element(result[0]).find('td')[1]).text()).to.contain('09:00');
            expect(angular.element(angular.element(result[1]).find('td')[1]).text()).to.contain('09:10');
            expect(angular.element(angular.element(result[2]).find('td')[1]).text()).to.contain('09:20');
        });

        it('soll die Tabelle laden', function () {
            render();
            expect(element.find('spi-tabelle')).to.exist;
            var result = element.find('spi-tabelle').find('tbody').find('tr');
            expect(angular.element(angular.element(result[0]).find('td')[1]).text()).to.contain('Team 1');
            expect(angular.element(angular.element(result[1]).find('td')[1]).text()).to.contain('Team 2');
            expect(angular.element(angular.element(result[2]).find('td')[1]).text()).to.contain('Team 3');
        });
    });
}());