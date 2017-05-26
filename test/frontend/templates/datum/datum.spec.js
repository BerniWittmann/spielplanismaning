(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Datum', function () {
        var URL = '/datum';
        var STATE_NAME = 'spi.event.datum';

        var spiele = [{
            _id: '1',
            platz: 1,
            datum: '21.07.2012',
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '2',
            platz: 2,
            datum: '21.07.2012',
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '3',
            platz: 3,
            datum: '21.07.2012',
            beendet: false,
            jugend: 'jgd1'
        }, {
            _id: '4',
            platz: 1,
            datum: '20.07.2012',
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '5',
            platz: 2,
            datum: '22.07.2012',
            beendet: false,
            jugend: 'jgd2'
        }, {
            _id: '6',
            platz: 1,
            datum: '21.07.2012',
            beendet: false,
            jugend: 'jgd2'
        }];
        var mockState = {
            called: false,
            go: function () {
                mockState.called = true;
            }
        };
        var mockErrorHandler = {
            called: false,
            handleResponseError: function () {
                mockErrorHandler.called = true;
            }
        };
        var mockSpiele;
        var mockConfig;
        var mockStateParams = {
            datum: '2012-07-21'
        };

        var injector;

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
        }, 'spi.templates.datum.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('spiel', mockSpiele);
            $provide.value('config', mockConfig);
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

            var ctrl = scope.vm = $controller('DatumController', {
                spiele: spiele,
                $state: mockState,
                $stateParams: mockStateParams,
                errorHandler: mockErrorHandler
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
                var promise = resolve('spiele').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(spiele);
            });
        });

        describe('es wird ein gültiges Datum aufgerufen', function () {
            before(function () {
                mockStateParams.datum = '2012-07-21';
            });

            it('soll das Datum angezeigt werden', function () {
                render();
                expect(element.find('h3').text()).to.contain('21.07.2012');
            });

            it('soll die Spiele des Datums laden', function () {
                render();
                expect(ctrl.spiele.length).to.be.equal(4);
            });
        });

        describe('es wird ein ungültiges Datum aufgerufen', function () {
            before(function () {
                mockStateParams.datum = 'notADate';
            });

            it('soll zur Home-Seite navigieren', function () {
                render();

                expect(mockState.called).to.be.true;
            });

            it('soll einen Fehler anzeigen', function () {
                render();

                expect(mockErrorHandler.called).to.be.true;
            });
        })
    });
}());