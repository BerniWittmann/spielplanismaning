(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Account', function () {
        var URL = '/account';
        var STATE_NAME = 'spi.shared.account';

        var user = {
            _id: '1234',
            username: 'test',
            email: 'test@byom.de',
            role: {
                name: 'Bearbeiter',
                rank: 0
            }
        };
        var form = {$valid: true, $setUntouched: function () {}};

        var mockAuthPromise;

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
            $stateProvider.state('spi.shared', {abstract: true});
        }, 'spi.templates.account.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module(function ($provide) {
            $provide.value('auth', mockAuthPromise);
        }));

        var mockAuth;
        var mockToastr = {
            success: function () {
            },
            error: function () {
            }
        };

        function compileRouteTemplateWithController($injector, state) {
            $rootScope = $injector.get('$rootScope');
            var $templateCache = $injector.get('$templateCache');
            var $compile = $injector.get('$compile');
            $state = $injector.get('$state');
            injector = $injector;

            var $controller = $injector.get('$controller');
            var scope = $rootScope.$new();
            var stateDetails = $state.get(state);
            var html = $templateCache.get(stateDetails.templateUrl);
            var $q = $injector.get('$q');
            mockAuth = {
                getUserDetails: function () {
                    return user
                },
                setUserDetails: function (data) {
                    return $q.when();
                },
                forgotPassword: function (email) {
                    return $q.when();
                }
            };

            mockAuthPromise = {
                getUserDetails: function () {
                    return $q.when(user);
                }
            };

            var ctrl = scope.vm = $controller('AccountController', {
                auth: mockAuth,
                userDetails: user,
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
            it('soll die User-Details resolven', function () {
                var promise = resolve('userDetails').forStateAndView(STATE_NAME);
                var res = promise.$$state.value;
                expect(res).to.deep.equal(user);
            });
        });

        it('Es werden die User Daten geladen geladen', function () {
            render();
            expect(ctrl.user).to.deep.equal(user);
        });

        describe('Die Formularfelder sollen mit den Nutzer-Daten gefüllt werden', function () {
            it('Der Nutzername soll geladen werden', function () {
                render();
                expect(element.find('input.form-control[type=text]').val()).to.equal(user.username);
            });

            it('Die Email soll geladen werden', function () {
                render();
                expect(element.find('input.form-control[type=email]').val()).to.equal(user.email);
            });

            it('Die Rolle soll geladen werden', function () {
                render();
                expect(element.find('.form-group > p').text()).to.contain(user.role.name);
            });
        });

        it('soll einen Link haben, der das Passwort zurücksetzen kann', function () {
            render();
            var el = element.find('a')
            expect(el).to.exist;
            expect(el.text()).to.contain('Passwort ändern');
            var spy = chai.spy.on(mockAuth, 'forgotPassword');

            el.click();

            expect(spy).to.have.been.called();
        });

        it('der Nutzername soll geändert werden können', function () {
            render();
            ctrl.user.username = 'NeuerUsername';
            var spy = chai.spy.on(mockAuth, 'setUserDetails');

            ctrl.changeUserDetails(form);

            var userNew = user;
            userNew.username = 'NeuerUsername';
            expect(spy).to.have.been.called.with(userNew);
        });

        it('die Email soll geändert werden können', function () {
            render();
            ctrl.user.email = 'NeueEmail';
            var spy = chai.spy.on(mockAuth, 'setUserDetails');

            ctrl.changeUserDetails(form);

            var userNew = user;
            userNew.email = 'NeueEmail';
            expect(spy).to.have.been.called.with(userNew);
        });
    });
}());