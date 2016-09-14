(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Verwaltung Alle Spiele Druck', function () {
        var URL = '/spiele-druck';
        var STATE_NAME = 'spi.verwaltung.spiele-druck';

        var spiele = [{
            nummer: 1,
            uhrzeit: '09:00',
            teamA: {
                _id: 't1',
                name: 'Team 1'
            },
            teamB: {
                _id: 't2',
                name: 'Team 2'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }, {
            nummer: 2,
            uhrzeit: '09:10',
            teamA: {
                _id: 't2',
                name: 'Team 2'
            },
            teamB: {
                _id: 't3',
                name: 'Team 3'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }, {
            nummer: 3,
            uhrzeit: '09:20',
            teamA: {
                _id: 't3',
                name: 'Team 3'
            },
            teamB: {
                _id: 't1',
                name: 'Team 1'
            },
            gruppe: {
                _id: 'g1',
                name: 'Gruppe 1'
            }
        }];
        var mockSpiel;
        var mockState = {
            go: function () {
            }
        };

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.verwaltung', {abstract: true});
        }, 'spi.verwaltung.spiele-druck.ui'));
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
            mockSpiel = {
                getAll: function () {
                    var deferred = $q.defer();
                    deferred.resolve({data: spiele});
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('SpieleDruckController', {
                spiel: mockSpiel,
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
                element = routeDetails.render();
            };
        }));

        it('soll auf die URL reagieren', function () {
            expect($state.href(STATE_NAME)).to.be.equal('#' + URL);
        });

        it('es werden die Spiele angezeigt', function () {
            render();
            var result = element.find('h2');
            expect(result).to.have.lengthOf(3);
            expect(angular.element(result[0]).text()).to.contain('09:00 Uhr');
            expect(angular.element(result[1]).text()).to.contain('09:10 Uhr');
            expect(angular.element(result[2]).text()).to.contain('09:20 Uhr');
            expect(ctrl.spiele).to.have.lengthOf(3);
        });

        it('Beim Klick auf die Gruppe wird man zur Gruppe navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-gruppe')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({gruppeid: 'g1'});
        });

        it('Beim Klick auf die Team A wird man zum Team A navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-teamA')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({teamid: 't1'});
        });

        it('Beim Klick auf die Team B wird man zu Team B navigiert', function () {
            render();
            var result = angular.element(element.find('.spiel-teamB')[0]);
            var spy = chai.spy.on(mockState, 'go');

            result.triggerHandler('click');

            expect(spy).to.have.been.called.with({teamid: 't2'});
        });

    });
}());