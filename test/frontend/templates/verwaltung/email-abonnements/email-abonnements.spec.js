(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Email-Abonnements', function () {
        var URL = '/email-abonnements';
        var STATE_NAME = 'spi.verwaltung.email-abonnements';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.email-abonnements.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('ngTable'));
        var form = {$valid: true};
        beforeEach(module(function ($provide) {
            $provide.value('email', mockEmail);
        }));

        var abonnements = [{
            email: 'Test1@test.de',
            team: {
                _id: 't1',
                name: 'Team 1',
                jugend: {
                    _id: 'j1',
                    name: 'Jugend 1'
                }
            }
        }, {
            email: 'Test2@test.de',
            team: {
                _id: 't1',
                name: 'Team 1',
                jugend: {
                    _id: 'j1',
                    name: 'Jugend 1'
                }
            }
        }, {
            email: 'Test3@test.de',
            team: {
                _id: 't2',
                name: 'Team 2',
                jugend: {
                    _id: 'j1',
                    name: 'Jugend 1'
                }
            }
        }];
        var mockEmail;
        var mockState = {
            go: function () {
            }
        };
        var mockBestaetigenDialog;
        var injector;

        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

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
            mockBestaetigenDialog = {
                open: function (msg, fn) {
                    return fn();
                }
            };
            mockEmail = {
                send: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                },
                getSubscribers: function () {
                    return $q.when(abonnements);
                }
            };

            var ctrl = scope.vm = $controller('EmailAbonnementsContoller', {
                email: mockEmail,
                $state: mockState,
                BestaetigenDialog: mockBestaetigenDialog,
                subscribers: abonnements
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
            it('soll die Abonnenten resolven', function () {
                var promise = resolve('subscribers').forStateAndView('spi.verwaltung.email-abonnements');
                var res = promise.$$state.value;
                expect(res).to.deep.equal(abonnements);
            });
        });

        it('Es werden die Abonnements geladen', function () {
            render();
            var result = element.find('tbody').find('tr');
            expect(result).to.have.lengthOf(3);
            expect(angular.element(result[0]).find('a').text()).to.contain('Test1@test.de');
            expect(angular.element(result[1]).find('a').text()).to.contain('Test2@test.de');
            expect(angular.element(result[2]).find('a').text()).to.contain('Test3@test.de');
        });

        it('Man soll eine Email an alle Abonnenten schicken können', function () {
            ctrl.email = {
                subject: 'Betreff',
                text: 'Test-Message Body'
            };
            var spy = chai.spy.on(mockEmail, 'send');

            ctrl.send(form);
            scope.$digest();

            expect(spy).to.have.been.called();
        });

        describe('Angenommen es sind keine Abonnements vorhanden', function () {
            before(function () {
                abonnements = [];
            });

            it('Es wird ein Hinweis angezeigt', function () {
                render();
                expect(element.find('tbody').find('tr')).to.have.lengthOf(0);
                var result = element.find('table').parent().find('.alert-info');
                expect(result).to.exist;
                expect(result.text()).to.contain('Keine Abonnements gefunden');
            });
        });
    });
}());