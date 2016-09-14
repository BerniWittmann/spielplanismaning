(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Gruppe', function () {
        var URL = '/gruppen/';
        var STATE_NAME = 'spi.tgj.gruppe';

        var gruppe = {
            _id: '1',
            name: 'Gruppe 1',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd1'
            }, teams: [{
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
        var mockGruppe;
        var mockStateParams = {
            gruppeid: '1'
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

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.tgj.gruppe.ui'));
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
                get: function () {
                    var deferred = $q.defer();
                    deferred.resolve(gruppe);
                    return deferred.promise;
                }
            };
            mockSpiel = {
                getByGruppe: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiele);
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('GruppeController', {
                gruppe: mockGruppe,
                $stateParams: mockStateParams,
                spiel: mockSpiel
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

        it('soll den Gruppennamen anzeigen', function () {
            render();
            expect(element.find('h3').text()).to.contain('Gruppe 1');
        });

        it('soll die Spiele laden', function () {
            render();
            expect(element.find('spi-spiele-tabelle')).to.exist;
            var result = element.find('spi-spiele-tabelle').find('tbody').find('tr');
            expect(result).to.have.lengthOf(3);
            expect(angular.element(angular.element(result[0]).find('td')[0]).text()).to.contain('09:00');
            expect(angular.element(angular.element(result[1]).find('td')[0]).text()).to.contain('09:10');
            expect(angular.element(angular.element(result[2]).find('td')[0]).text()).to.contain('09:20');
        });

        it('soll die Tabelle laden', function () {
            render();
            expect(element.find('spi-tabelle')).to.exist;
            var result = element.find('spi-tabelle').find('tbody').find('tr');
            expect(angular.element(angular.element(result[0]).find('td')[1]).text()).to.contain('Team 1');
            expect(angular.element(angular.element(result[1]).find('td')[1]).text()).to.contain('Team 2');
            expect(angular.element(angular.element(result[2]).find('td')[1]).text()).to.contain('Team 3');
        });
    });
}());