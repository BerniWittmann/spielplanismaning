(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Allgemein', function () {
        var URL = '/teams';
        var STATE_NAME = 'spi.verwaltung.teams';

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.verwaltung.teams.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('spi.logger'));
        beforeEach(module('spi.bestaetigen-modal.ui'));

        var jugenden = [{
            _id: 'j1',
            name: 'Jugend 1'
        }, {
            _id: 'j2',
            name: 'Jugend 2'
        }, {
            _id: 'j3',
            name: 'Jugend 3'
        }];
        var teams = [{
            _id: 't1',
            name: 'Team 1',
            jugend: 'j1'
        }, {
            _id: 't2',
            name: 'Team 2',
            jugend: 'j2'
        }, {
            _id: 't3',
            name: 'Team 3',
            jugend: 'j3'
        }];
        var mockScope = {
            $watch: function () {
            },
            $apply: function () {
            }
        };
        var mockAuth;
        var mockJugend;
        var mockSpielplan;
        var mockTeam;
        var mockTimeout = function (fn) {
            fn();
        };
        var mockWindow = {
            scrollTo: function () {
            }
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
            $httpBackend = $injector.get('$httpBackend');
            mockAuth = {
                hatZugriff: true,
                canAccess: function () {
                    return mockAuth.hatZugriff;
                }
            };
            mockJugend = {
                create: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }, getAll: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: jugenden});
                    return deferred.promise;
                }
            };
            mockSpielplan = {
                error: undefined,
                createSpielplan: function () {
                }
            };
            mockTeam = {
                getAll: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: teams});
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('VerwaltungTeamsController', {
                $scope: mockScope,
                auth: mockAuth,
                jugend: mockJugend,
                spielplan: mockSpielplan,
                team: mockTeam,
                $timeout: mockTimeout,
                $window: mockWindow
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
                $httpBackend.expectGET('/api/spielplan/ausnahmen').respond(201, {});
                $httpBackend.expectGET('/api/gruppen?jugend=j1').respond(201, {});
                $httpBackend.expectGET('/api/gruppen?jugend=j2').respond(201, {});
                $httpBackend.expectGET('/api/gruppen?jugend=j3').respond(201, {});
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        it('Es werden die Jugenden geladen', function () {
            render();

            expect(ctrl.jugenden).to.have.lengthOf(3);
            expect(element.find('spi-jugend-panel')).to.have.lengthOf(3);
        });

        it('Man kann eine Jugend hinzufügen', function () {
            render();
            expect(element.find('form')).to.exist;
            ctrl.jugend = {
                name: 'Jugend Test',
                color: 'lila'
            };
            var spy = chai.spy.on(mockJugend, 'create');
            var spySpielplan = chai.spy.on(mockSpielplan, 'createSpielplan');

            ctrl.addJugend();
            scope.$digest();

            expect(spy).to.have.been.called();
            expect(spySpielplan).to.have.been.called();
        });

        it('Es werden die Ausnhamen angezeigt', function () {
            render();
            expect(element.find('spi-spielplan-ausnahmen')).to.exist;
        });
    });
}());