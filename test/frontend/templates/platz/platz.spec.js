(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Platz', function () {
        var URL = '/platz';
        var STATE_NAME = 'spi.platz';

        var spiele = [{
            _id: '1',
            platz: 1,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '2',
            platz: 2,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '3',
            platz: 3,
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '4',
            platz: 1,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '5',
            platz: 2,
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '6',
            platz: 1,
            beendet: false,
            jugend: 'jgd2'
        }];
        var mockState = {
            go: function () {
            }
        };
        var mockSpiele;
        var mockStateParams = {
            platznummer: 1
        };

        var mockErrorHandler = {
            handleResponseError: function () {}
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
        }, 'spi.templates.platz.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiele);
            $provide.value('Logger', {});
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

            var ctrl = scope.vm = $controller('PlatzController', {
                spiele: spiele,
                $state: mockState,
                $stateParams: mockStateParams,
                errorHandler: mockErrorHandler,
                anzahlPlaetze: 3
            });
            $rootScope.$digest();
            var compileFn = $compile(angular.element('<div></div>').html(html));

            mockSpiele = {
                getAll: function () {
                    return $q.when(spiele);
                }
            };

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
            it('soll Spiele resolven', function () {
                var promise = resolve('spiele').forStateAndView('spi.platz');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        it('soll der Platz angezeigt werden', function () {
            render();
            expect(element.find('h3').text()).to.contain('Platz 1');
        });

        it('soll die Spiele des Platzes laden', function () {
            render();
            expect(ctrl.spiele.length).to.be.equal(3);
        });
    });
}());