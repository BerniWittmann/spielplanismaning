(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Tabellen', function () {
        var URL = '/tabellen';
        var STATE_NAME = 'spi.event.tabellen';

        var jugenden = [{
            _id: '1',
            name: 'Jugend 1',
            gruppen: [{
                name: 'Gruppe 1',
                _id: 'grp1',
                jugend: {
                    _id: '1'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 2',
                _id: 'grp2',
                jugend: {
                    _id: '1'
                },
                teams: [{}, {}, {}]
            }]
        }, {
            _id: '2',
            name: 'Jugend 2',
            gruppen: [{
                name: 'Gruppe 3',
                _id: 'grp3',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 4',
                _id: 'grp4',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 5',
                _id: 'grp5',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }]
        }, {
            _id: '3',
            name: 'Jugend 3',
            gruppen: []
        }];
        var gruppen = [
            {
                name: 'Gruppe 1',
                _id: 'grp1',
                jugend: {
                    _id: '1'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 2',
                _id: 'grp2',
                jugend: {
                    _id: '1'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 3',
                _id: 'grp3',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 4',
                _id: 'grp4',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }, {
                name: 'Gruppe 5',
                _id: 'grp5',
                jugend: {
                    _id: '2'
                },
                teams: [{}, {}, {}]
            }
        ]
        var mockJugend;
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
        }, 'spi.templates.tabellen.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('jugend', mockJugend);
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
            mockJugend = {
                getTore: function (id) {
                    var deferred = $q.defer();
                    deferred.resolve(parseInt(id) * 3);
                    return deferred.promise;
                },
                getAll: function () {
                    return $q.when(jugenden);
                },
                getGesamtTore: function () {
                    return $q.when(18);
                }
            };

            var ctrl = scope.vm = $controller('TabellenController', {
                jugend: mockJugend,
                jugenden: jugenden,
                jugendTore: 18,
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
            it('soll die Jugenden resolven', function () {
                var promise = resolve('jugenden').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(jugenden);
            });

            it('soll die Tore der Jugenden resolven', function () {
                var promise = resolve('jugendTore').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(18);
            });
        });

        it('soll die Jugenden anzeigen', function () {
            render();
            expect(element.find('h4 > spi-jugend-label')).to.have.lengthOf(3);
        });

        it('soll die Gruppen der Jugenden laden', function () {
            render();
            var result = element.find('spi-tabelle');
            expect(result).to.have.lengthOf(5);
            var index = 1;
            _.forEach(result, function (el) {
                el = angular.element(el);
                var gruppe = el.scope().gruppe;
                expect(gruppe._id).to.be.equal('grp' + index);
                expect(gruppe.teams).to.have.lengthOf(3);
                index++;
            });

        });

        it('soll die Tore für jede Jugend anzeigen', function () {
            render();
            var result = element.find('.jugend-tore');
            var index = 1;
            _.forEach(result, function (el) {
                el = angular.element(el);
                expect(el.text()).to.be.equal(index * 3 + '');
                index++;
            });
        });

        it('soll die Gesamttore anzeigen', function () {
            render();
            expect(element.find('#tore-gesamt').text()).to.be.equal('18');
        });

        describe('Es werden keine Jugenden gefunden', function () {
            before(function () {
                jugenden = [];
            });

            it('sollen keine Tabellen angezeigt werden', function () {
                render();
                expect(element.find('spi-tabelle')).not.to.exist;
            });

            it('soll ein Hinweis angezeigt werden', function () {
                render();
                var result = element.find('.alert-info');
                expect(result).to.exist;
                expect(result.length).to.be.above(0);
                expect(result.text()).to.contain('Keine Jugenden gefunden');
            });
        });
    });
}());