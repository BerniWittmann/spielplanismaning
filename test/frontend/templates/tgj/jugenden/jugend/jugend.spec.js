(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Jugend', function () {
        var URL = '/jugenden/';
        var STATE_NAME = 'spi.tgj.jugend';

        var jugend = {
            _id: '1',
            name: 'Jugend 1',
            gruppen: [{
                name: 'Gruppe 1',
                _id: 'g1'
            }, {
                name: 'Gruppe 2',
                _id: 'g2'
            }], teams: [{
                name: 'Team 1',
                _id: 't1'
            }, {
                name: 'Team 2',
                _id: 't2'
            }, {
                name: 'Team 3',
                _id: 't3'
            }]
        };
        var mockJugend;
        var mockStateParams = {
            jugendid: '1'
        };
        var spiele = [{
            nummer: 1,
            uhrzeit: '09:00',
            teamA: 't1',
            teamB: 't2'
        }, {
            nummer: 2,
            uhrzeit: '09:10',
            teamA: 't2',
            teamB: 't3'
        }, {
            nummer: 3,
            uhrzeit: '09:20',
            teamA: 't3',
            teamB: 't1'
        }];
        var mockSpiel;
        var mockScope = {
            $watch: function (fn1, fn2) {
                fn2();
            }
        };

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.tgj.jugend.ui'));
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
            mockJugend = {
                get: function () {
                    var deferred = $q.defer();
                    deferred.resolve(jugend);
                    return deferred.promise;
                }
            };
            mockSpiel = {
                getByJugend: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiele);
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('JugendController', {
                jugend: mockJugend,
                $stateParams: mockStateParams,
                spiel: mockSpiel,
                $scope: mockScope
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

        it('soll den Jugendnamen anzeigen', function () {
            render();
            expect(element.find('h3 > spi-jugend-label')).to.exist;
            expect(ctrl.jugend.name).to.be.equal('Jugend 1');
        });

        it('soll die Spiele anzeigen', function () {
            render();
            expect(element.find('spi-spiele-tabelle')).to.exist;
            expect(ctrl.spiele).to.have.lengthOf(3);
        });

        it('soll die Gruppen der Jugend laden', function () {
            render();
            expect(element.find('spi-panel')).to.have.lengthOf(2);
            var result = element.find('spi-panel-titel > a');
            expect(angular.element(result[0]).text()).to.contain('Gruppe 1');
            expect(angular.element(result[1]).text()).to.contain('Gruppe 2');
        });
    });
}());