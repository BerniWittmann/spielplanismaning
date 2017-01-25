(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Ansprechpartner', function () {
        var URL = '/ansprechpartner';
        var STATE_NAME = 'spi.verwaltung.ansprechpartner';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.templates.verwaltung.ansprechpartner.ui'));
        beforeEach(module('htmlModule'));

        var ansprechpartner = [{
            email: 'Test1@test.de',
            name: 'Test 1',
            turnier: 'Test Turnier 1'
        }, {
            email: 'Test2@test.de',
            name: 'Test 2',
            turnier: 'Test Turnier 2'
        }];

        var mockAnsprechpartner;

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
            mockAnsprechpartner = {
                getAll: function () {
                    var deferred = $q.defer();
                    deferred.resolve(ansprechpartner);
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('AnsprechpartnerController', {
                $scope: scope,
                kontakte: ansprechpartner,
                ansprechpartner: mockAnsprechpartner
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

        it('Es werden die Ansprechpartner geladen', function () {
            render();
            var result = element.find('tbody').find('tr');
            expect(result).to.have.lengthOf(2);

            expect(ctrl.ansprechpartner).to.deep.equal(ansprechpartner);
        });

        it('Es soll ein Button zum Hinzufügen existieren', function () {
            render();

            var result = element.find('a');
            expect(result.text()).to.contain('Hinzufügen');
        });

        it('Man soll einen Ansprechpartner hinzufügen können', function () {
            ctrl.add();
            scope.$digest();

            expect(ctrl.ansprechpartner.length).to.equal(3);
            var result = element.find('tr');
            expect(result).to.have.lengthOf(3);
        });

        describe('Angenommen es sind keine Abonnements vorhanden', function () {
            before(function () {
                ansprechpartner = [];
            });

            it('Es wird ein Hinweis angezeigt', function () {
                render();
                expect(element.find('tbody').find('tr')).to.have.lengthOf(0);
                var result = element.find('.alert-info');
                expect(result).to.exist;
                expect(result.text()).to.contain('Keine Ansprechpartner gefunden');
            });

            it('Wird der Hinzufügen Button angezeigt', function () {
                render();

                var result = element.find('a');
                expect(result.text()).to.contain('Hinzufügen');
            });
        });
    });
}());