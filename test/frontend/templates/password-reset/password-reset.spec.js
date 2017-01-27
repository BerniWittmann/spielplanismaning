(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Password Reset', function () {
        var URL = '/reset-password';
        var STATE_NAME = 'spi.password-reset';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.password-reset.ui'));
        beforeEach(module('htmlModule'));

        var form = {$valid: true};
        var mockAuth;
        var mockToastr = {
            success: function () {
            },
            error: function () {
            }
        };
        var isValidToken = true;
        var mockState = {
            go: function () {
            }
        };
        var mockStateParams = {
            token: '1234'
        };


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
            mockAuth = {
                resetPassword: function () {
                    return $q.when();
                }
            };

            var ctrl = scope.vm = $controller('PasswordResetController', {
                auth: mockAuth,
                toastr: mockToastr,
                $state: mockState,
                $stateParams: mockStateParams,
                isValidToken: isValidToken
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

        it('Es wird ein Feld für die Eingabe des Nutzernamens angezeigt', function () {
            render();
            var el = element.find('input.form-control[type=text]');
            expect(el).to.exist;
        });

        it('Es sollen zwei Felder für die Passworteingabe angezeigt werden', function () {
            render();
            var el = element.find('input.form-control[type=password]');
            expect(el).to.have.lengthOf(2);
        });

        it('wenn die Passwörter nicht übereinstimmen, dann soll das neue Passwort nicht gespeichert werden', function () {
            render();
            var spy = chai.spy.on(mockAuth, 'resetPassword');
            ctrl.username = 'Test';
            ctrl.password = '1234';
            ctrl.passwordCheck = '1235';

            ctrl.resetPassword(form);
            scope.$digest();

            expect(spy).not.to.have.been.called();
        });

        it('ohne Benutzername soll das neue Passwort nicht gespeichert werden', function () {
            render();
            var spy = chai.spy.on(mockAuth, 'resetPassword');
            ctrl.password = '1234';
            ctrl.passwordCheck = '1234';

            ctrl.resetPassword(form);
            scope.$digest();

            expect(spy).not.to.have.been.called();
        });

        it('ohne Passwort soll das neue Passwort nicht gespeichert werden', function () {
            render();
            var spy = chai.spy.on(mockAuth, 'resetPassword');
            ctrl.username = 'Test';

            ctrl.resetPassword(form);
            scope.$digest();

            expect(spy).not.to.have.been.called();
        });

        it('das neue Passwort soll gespeichert werden', function () {
            render();
            var spy = chai.spy.on(mockAuth, 'resetPassword');
            ctrl.username = 'Test';
            ctrl.password = '1234';
            ctrl.passwordCheck = '1234';

            ctrl.resetPassword(form);
            scope.$digest();

            expect(spy).to.have.been.called();
        });
    });
}());