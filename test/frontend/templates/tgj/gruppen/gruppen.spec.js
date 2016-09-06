(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Gruppen', function () {
        var URL = '/gruppen';
        var STATE_NAME = 'spi.tgj.gruppen';

        var gruppen = [{
            _id: '1',
            name: 'Gruppe 1',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd1'
            }
        }, {
            _id: '2',
            name: 'Gruppe 2',
            jugend: {
                name: 'Jugend 2',
                _id: 'jgd2'
            }
        }, {
            _id: '3',
            name: 'Gruppe 3',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd1'
            }
        }];
        var mockGruppe;
        var mockState = {
            go: function () {
            }
        };

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.tgj.gruppen.ui'));
        beforeEach(module('htmlModule'));

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
            mockGruppe = {
                getAll: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: gruppen});
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('GruppenController', {
                gruppe: mockGruppe,
                $state: mockState
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
                $httpBackend.expectGET('/api/gruppen?id=1').respond(201, gruppen[0]);
                $httpBackend.expectGET('/api/gruppen?id=2').respond(201, gruppen[1]);
                $httpBackend.expectGET('/api/gruppen?id=3').respond(201, gruppen[2]);
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        it('soll die Gruppen anzeigen', function () {
            render();
            var result = element.find('spi-gruppen-panel');
            expect(result).to.have.lengthOf(3);
            expect(angular.element(result[0]).find('spi-panel-titel > a').text()).to.contain('Gruppe 1');
            expect(angular.element(result[1]).find('spi-panel-titel > a').text()).to.contain('Gruppe 2');
            expect(angular.element(result[2]).find('spi-panel-titel > a').text()).to.contain('Gruppe 3');
        });

        describe('Es werden keine Gruppen gefunden', function () {
            before(function () {
                gruppen = [];
            });

            it('Es soll ein Hinweis angezeigt werden', function () {
                render();
                expect(element.find('spi-gruppen-panel')).to.have.lengthOf(0);
                var result = element.find('div.alert-info');
                expect(result).to.exist;
                expect(result.text()).to.contain('Keine Gruppen gefunden');
            });
        });
    });
}());