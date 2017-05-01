(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Allgemein', function () {
        var URL = '/allgemein';
        var STATE_NAME = 'spi.verwaltung.allgemein';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.allgemein.ui'));
        beforeEach(module('htmlModule'));

        var mockAuth;
        var form = {$valid: true, $setUntouched: function () {}};
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
            injector = $injector;
            $httpBackend = $injector.get('$httpBackend');
            mockAuth = {
                bereitsRegistriert: false,
                register: function () {
                    var deferred = $q.defer();
                    if (mockAuth.bereitsRegistriert) {
                        deferred.reject({
                            MESSAGEKEY: 'ERROR_USER_ALREADY_EXISTS',
                            MESSAGE: 'Benutzer test existiert bereits'
                        });
                    } else {
                        deferred.resolve();
                    }
                    return deferred.promise;
                },
                currentUser: function () {
                    return 'Test'
                },
                deleteUser: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('VerwaltungAllgemeinController', {
                auth: mockAuth
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

        it('soll einen Nutzer registrieren können', function () {
            render();
            ctrl.user = {
                username: 'Test',
                email: 'test1234@byom.de',
                role: 'Bearbeiter'
            };
            var spy = chai.spy.on(mockAuth, 'register');

            ctrl.register(form);
            scope.$digest();

            expect(spy).to.have.been.called();
            var result = element.find('.alert-success');
            expect(result).to.exist;
            expect(result.text()).to.contain('Test wurde registriert');
        });

        it('Wenn der Nutzer bereits vorhanden ist, soll ein Fehler angezeigt werden', function () {
            mockAuth.bereitsRegistriert = true;
            render();
            ctrl.user = {
                username: 'Test',
                email: 'test123@byom.de',
                role: 'Bearbeiter'
            };

            ctrl.register(form);
            scope.$digest();

            var result = element.find('.alert-danger');
            expect(result).to.exist;
            expect(result.text()).to.contain('Benutzer test existiert bereits');
        });

        it('soll einen Nutzer löschen können', function () {
            render();
            ctrl.username = 'Berni';
            var spy = chai.spy.on(mockAuth, 'deleteUser');

            ctrl.delete(form);
            scope.$digest();

            expect(spy).to.have.been.called();
            var result = element.find('.alert-success');
            expect(result).to.exist;
            expect(result.text()).to.contain('User gelöscht!');
        });

        it('Wenn der Nutzer gerade angemeldet ist, kann er nicht gelöscht werden', function () {
            render();
            ctrl.username = 'Test';

            ctrl.delete(form);
            scope.$digest();

            var result = element.find('.alert-danger');
            expect(result).to.exist;
            expect(result.text()).to.contain('Gerade angemeldeter User kann nicht gelöscht werden.');
        });
    });
}());