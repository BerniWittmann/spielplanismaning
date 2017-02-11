(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Login', function () {
        var URL = '/login';
        var STATE_NAME = 'spi.login';

        var mockAuth;
        var mockState = {
            go: function () {
            }
        };
        var mockToastr = {
            error: function () {}
        };
        var form = {$valid: true};

        var lockdown = false;

        function resolve(value) {
            return {forStateAndView: function (state, view) {
                var viewDefinition = view ? $state.get(state).views[view] : $state.get(state);
                var res = viewDefinition.resolve[value];
                $rootScope.$digest();
                return injector.invoke(res);
            }};
        }

        var mockConfig;

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.login.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('config', mockConfig);
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

            mockAuth = {
                register: function () {
                },
                logIn: function (user) {
                    var deferred = $q.defer();
                    if (_.isEqual(user.username, 'berni') && _.isEqual(user.password, '12345')) {
                        deferred.resolve();
                    } else {
                        deferred.reject({MESSAGE: 'Falscher Username/Passwort'});
                    }
                    return deferred.promise;
                }
            };
            var form = {$valid: true};

            mockConfig = {
                getLockdown: function () {
                    return $q.when(true);
                }
            };

            var ctrl = scope.vm = $controller('LoginController', {
                auth: mockAuth,
                $state: mockState,
                lockdown: (lockdown || false),
                toastr: mockToastr
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

        var element, render, ctrl, scope, $state, $rootScope, $controller, injector;

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
            it('soll den Lockdownmode resolven', function () {
                var promise = resolve('lockdown').forStateAndView('spi.login');
                var res = promise.$$state.value;
                expect(res).to.equal(true);
            });
        });

        describe('Der Lockdownmode ist aktiviert', function () {
            before(function () {
                lockdown = true;
            });

            it('Der Lockdown-Hinweis wird angezeigt', function () {
                render();
                var result = element.find('#login-lockdown-hinweis');
                expect(result).to.exist;
            });
        });

        describe('Der Lockdownmode ist deaktiviert', function () {
            before(function () {
                lockdown = false;
            });

            it('Der Lockdown-Hinweis wird nicht angezeigt', function () {
                render();
                var result = element.find('#login-lockdown-hinweis');
                expect(result).not.to.exist;
            });
        });

        it('soll das Login-Formular zeigen', function () {
            render();
            var result = element.find('input');
            expect(result.length).to.be.equal(2);
        });

        it('soll einen User anmelden', function () {
            render();
            var spy = chai.spy.on(mockAuth, 'logIn');
            ctrl.user = {
                username: 'berni',
                password: '12345'
            };

            ctrl.login(form);

            expect(spy).to.have.been.called.with({
                username: 'berni',
                password: '12345'
            });
        });
    });
}());