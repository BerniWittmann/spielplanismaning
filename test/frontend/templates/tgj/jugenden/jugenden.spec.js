(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Jugenden', function () {
        beforeEach(module('spi.constants'));
        var URL = '/turniere';
        var STATE_NAME = 'spi.tgj.jugenden';

        var jugenden = [{
            _id: '1',
            name: 'Jugend 1',
            gruppen: [{
                name: 'Gruppe 1',
                _id: 'g1'
            }, {
                name: 'Gruppe 2',
                _id: 'g2'
            }]
        }, {
            _id: '2',
            name: 'Jugend 2',
            gruppen: [{
                name: 'Gruppe 3',
                _id: 'g3'
            }]
        }, {
            _id: '3',
            name: 'Jugend 3',
            gruppen: []
        }];

        var mockErrorHandler = {
            handleResponseError: function () {}
        };
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

        beforeEach(function () {
            module(function ($provide) {
                $provide.value('errorHandler', mockErrorHandler);
            });
        });

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.templates.tgj.jugenden.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('spi.logger'));
        beforeEach(module('spi.components.bestaetigen-modal.ui'));
        beforeEach(module(function ($provide) {
            $provide.value('jugend', mockJugend);
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

            mockJugend = {
                getAll: function () {
                    return $q.when(jugenden);
                }
            };

            var ctrl = scope.vm = $controller('JugendenController', {
                jugenden: jugenden,
                errorHandler: mockErrorHandler
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
                if (jugenden.length > 0) {
                    $httpBackend.expectGET('/api/gruppen?jugend=1').respond(201, {data: jugenden[0].gruppen});
                    $httpBackend.expectGET('/api/gruppen?jugend=2').respond(201, {data: jugenden[1].gruppen});
                    $httpBackend.expectGET('/api/gruppen?jugend=3').respond(201, {data: jugenden[2].gruppen});
                } else {
                    $httpBackend.expectGET('/api/gruppen?jugend=1').respond(201, {data: []});
                    $httpBackend.expectGET('/api/gruppen?jugend=2').respond(201, {data: []});
                    $httpBackend.expectGET('/api/gruppen?jugend=3').respond(201, {data: []});
                }
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        describe('Resolves', function () {
            it('soll die Jugenden resolven', function () {
                var promise = resolve('jugenden').forStateAndView('spi.tgj.jugenden');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(jugenden);
            });
        });

        it('soll die Jugenden laden', function () {
            render();
            expect(element.find('spi-jugend-panel')).to.have.lengthOf(3);
        });

        describe('Es werden keine Jugenden gefunden', function () {
            before(function () {
                jugenden = [];
            });

            it('soll ein Hinweis angezeigt werden', function () {
                render();
                expect(element.find('spi-jugend-panel')).not.to.exist;
                var result = element.find('div.alert-info');
                expect(result).to.exist;
                expect(result.text()).to.be.equal('Keine Jugenden gefunden');
            });
        });
    });
}());