(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Team-Deabonnieren', function () {
        var URL = '/teams//deabonnieren';
        var STATE_NAME = 'spi.team-deabonnieren';

        var team = {
            _id: '1',
            name: 'Team 1',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd'
            },
            gruppe: {
                name: 'Gruppe 2',
                _id: 'grp2'
            }
        };
        var abonnement = [{
            team: '1',
            email: 'test@t.de'
        }];
        var mockStateParams = {
            teamid: '1'
        };
        var mockTimeout = function () {
        };
        var mockState = {
            go: function () {
            }
        };
        var mockEmail;

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
        }, 'spi.templates.teamdeabonnieren.ui'));
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
            mockEmail = {
                getSubscriptionByTeam: function () {
                    return abonnement;
                },
                checkSubscription: function () {
                    return true;
                },
                removeSubscription: function () {
                    var deferred = $q.defer();
                    deferred.resolve();
                    return deferred.promise;
                }
            };

            var ctrl = scope.vm = $controller('TeamDeabonnierenController', {
                aktivesTeam: team,
                $state: mockState,
                email: mockEmail,
                $timeout: mockTimeout,
                $stateParams: mockStateParams
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

        it('Der Team-Name wird angezeigt', function () {
            render();
            expect(element.find('.page-header > h3').text()).to.contain('Team 1');
        });

        it('Der Gruppen-Name wird angezeigt', function () {
            render();
            expect(element.find('.page-header > h3').text()).to.contain('Gruppe 2');
        });

        it('Das Jugend-Label wird angezeigt', function () {
            render();
            var result = element.find('spi-jugend-label');
            expect(result).to.exist;
            expect(ctrl.team.jugend).to.deep.equal({
                name: 'Jugend 1',
                _id: 'jgd'
            });
        });

        it('Die Email wird vorab geladen', function () {
            render();
            var result = element.find('input');
            expect(result).to.exist;
            expect(result.val()).to.be.equal('test@t.de');
        });

        it('Beim Klick auf bestätigen werden die News abbestellt', function () {
            render();
            var spy = chai.spy.on(mockEmail, 'removeSubscription');

            ctrl.abbestellen();
            scope.$digest();

            expect(spy).to.have.been.called();
        });

        it('Nach dem Abmelden wird ein Hinweis angezeigt und das Formular ausgeblendet', function () {
            render();

            ctrl.abbestellen();
            scope.$digest();

            var result = element.find('.alert-success');
            expect(result).to.exist;
            expect(result.text()).to.contain('Sie wurden erfoglreich abgemeldet!');
            expect(element.find('form')).to.not.exist;
        });
    });

}());