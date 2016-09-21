(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Teams', function () {
        var URL = '/teams';
        var STATE_NAME = 'spi.tgj.teams';

        var teams = [{
            _id: '1',
            name: 'Team 1',
            gruppe: {
                name: 'Gruppe 1',
                _id: 'g1'
            },
            jugend: {
                name: 'Jugend 1',
                _id: 'j1'
            }
        }, {
            _id: '2',
            name: 'Team 2',
            gruppe: {
                name: 'Gruppe 1',
                _id: 'g1'
            },
            jugend: {
                name: 'Jugend 1',
                _id: 'j1'
            }
        }, {
            _id: '3',
            name: 'Team 3',
            gruppe: {
                name: 'Gruppe 2',
                _id: 'g2'
            },
            jugend: {
                name: 'Jugend 1',
                _id: 'j1'
            }
        }, {
            _id: '4',
            name: 'Team 4',
            gruppe: {
                name: 'Gruppe 3',
                _id: 'g3'
            },
            jugend: {
                name: 'Jugend 2',
                _id: 'j2'
            }
        }];
        var mockState = {
            go: function () {
            }
        };

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.tgj.teams.ui'));
        beforeEach(module('htmlModule'));
        beforeEach(module('ngTable'));

        function compileRouteTemplateWithController($injector, state) {
            $rootScope = $injector.get('$rootScope');
            var $templateCache = $injector.get('$templateCache');
            var $compile = $injector.get('$compile');
            $state = $injector.get('$state');

            var $controller = $injector.get('$controller');
            var scope = $rootScope.$new();
            var stateDetails = $state.get(state);
            var html = $templateCache.get(stateDetails.templateUrl);

            var ctrl = scope.vm = $controller('TeamsController', {
                $state: mockState,
                teamPromise: {data: teams}
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

        it('soll die Teams laden', function () {
            render();
            var result = element.find('tbody').find('tr');
            expect(result).to.have.lengthOf(4);
            expect(angular.element(angular.element(result[0]).find('td')[0]).text()).to.contain('Team 1');
            expect(angular.element(angular.element(result[1]).find('td')[0]).text()).to.contain('Team 2');
            expect(angular.element(angular.element(result[2]).find('td')[0]).text()).to.contain('Team 3');
            expect(angular.element(angular.element(result[3]).find('td')[0]).text()).to.contain('Team 4');
        });

        describe('Es werden keine Teams gefunden', function () {
            before(function () {
                teams = [];
            });

            //TODO Test ergänzen, wenn umgesetzt
            it('soll ein Hinweis angezeigt werden'/*, function () {
             render();
             expect(element.find('table')).to.not.exist;
             var result = element.find('div.alert-info');
             expect(result).to.exist;
             expect(result.text()).to.contain('Keine Teams gefunden');
             }*/);
        });
    });
}());