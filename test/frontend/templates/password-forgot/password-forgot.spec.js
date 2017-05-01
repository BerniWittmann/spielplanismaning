(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Password Forgot', function () {
        var URL = '/forgot-password';
        var STATE_NAME = 'spi.password-forgot';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.password-forgot.ui'));
        beforeEach(module('htmlModule'));

        var mockAuth;
        var mockToastr = {
            success: function () {
            },
            error: function () {
            }
        };
        var form = {$valid: true, $setUntouched: function () {}};

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
                forgotPassword: function (email) {
                    return $q.when();
                }
            };

            var ctrl = scope.vm = $controller('PasswordForgotController', {
                auth: mockAuth,
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

        it('Es wird ein Feld für die Eingabe der Email angezeigt', function () {
            render();
            var el = element.find('input.form-control[type=email]');
            expect(el).to.exist;
        });

        it('Es soll ein neues Passwort beantragt werden können', function () {
            render();
            ctrl.email = 'test@byom.de';
            var spy = chai.spy.on(mockAuth, 'forgotPassword');

            ctrl.forgotPassword(form);

            expect(spy).to.have.been.called.with('test@byom.de');
        });

        it('Es soll ein Hinweis angezeigt werden, wenn ein Passwort beantragt wurde', function () {
            render();
            ctrl.email = 'test@byom.de';
            var spy = chai.spy.on(mockToastr, 'success');

            ctrl.forgotPassword(form);
            scope.$digest();

            expect(spy).to.have.been.called();
        });
    });
}());