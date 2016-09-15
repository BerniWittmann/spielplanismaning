(function () {
    'use strict';

    var expect = chai.expect;

    describe('Template: Team', function () {
        var URL = '/teams/';
        var STATE_NAME = 'spi.tgj.team';

        var team = {
            _id: '1',
            name: 'Team 1',
            jugend: {
                name: 'Jugend 1',
                _id: 'jgd1'
            }, gruppe: {
                name: 'Gruppe 1',
                _id: 'grp1',
                teams: [{
                    name: 'Team 1',
                    _id: 't1'
                }, {
                    name: 'Team 2',
                    _id: 't2'
                }, {
                    name: 'Team 3',
                    _id: 't3'
                }]
            }
        };
        var mockTeam;
        var mockStateParams = {
            teamid: '1'
        };
        var spiele = [{
            nummer: 1,
            uhrzeit: '09:00',
            teamA: 't1',
            teamB: 't2'
        }, {
            nummer: 3,
            uhrzeit: '09:20',
            teamA: 't3',
            teamB: 't1'
        }];
        var mockSpiel;
        var mockTeamAbonnierenDialog;
        var mockScope = {
            $watch: function (fn1, fn2) {
                fn2();
            }
        };
        var mockEmail = {
            isSubscribed: false,
            checkSubscription: function () {
                return mockEmail.isSubscribed;
            }
        };

        beforeEach(module('ui.router', function ($stateProvider) {
            $stateProvider.state('spi', {abstract: true});
            $stateProvider.state('spi.tgj', {abstract: true});
        }, 'spi.tgj.team.ui'));
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
            mockTeam = {
                get: function () {
                    var deferred = $q.defer();
                    deferred.resolve(team);
                    return deferred.promise;
                }, getByGruppe: function () {
                    var deferred = $q.defer();
                    deferred.resolve(team.gruppe.teams);
                    return deferred.promise;
                }
            };
            mockSpiel = {
                getByTeam: function () {
                    var deferred = $q.defer();
                    deferred.resolve(spiele);
                    return deferred.promise;
                }
            };
            mockTeamAbonnierenDialog = {
                open: function () {
                    var deferred = $q.defer();
                    deferred.resolve('Testytest');
                    return {
                        closed: deferred.promise
                    }
                }
            };

            var ctrl = scope.vm = $controller('TeamController', {
                team: mockTeam,
                $stateParams: mockStateParams,
                spiel: mockSpiel,
                TeamAbonnierenDialog: mockTeamAbonnierenDialog,
                $scope: mockScope,
                email: mockEmail
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

        it('soll den Teamnamen anzeigen', function () {
            render();
            expect(element.find('h3').text()).to.contain('Team 1');
        });

        it('es werden die Spiele angezeigt', function () {
            render();
            expect(element.find('spi-spiele-tabelle')).to.exist;
            expect(ctrl.spiele).to.have.lengthOf(2);
        });

        it('es wird die Tabelle angezeigt', function () {
            render();
            expect(element.find('spi-tabelle')).to.exist;
            expect(ctrl.teams).to.have.lengthOf(3);
        });

        it('soll ein Button zum Abonnieren angezeigt werden', function () {
            render();
            var result = element.find('h3 > button');
            expect(result).to.exist;
            expect(result.text()).to.contain('Team abonnieren');
            expect(result).not.to.have.class('disabled');
        });

        it('Beim Klick auf den Abonnieren-Button soll das Team abonniert werden können', function () {
            render();
            var result = element.find('h3 > button');
            var spy = chai.spy.on(mockTeamAbonnierenDialog, 'open');

            mockEmail.isSubscribed = true;
            result.triggerHandler('click');
            scope.$apply();

            expect(spy).to.have.been.called.with(team);
            expect(ctrl.bereitsAbonniert).to.be.true;
            expect(result.text()).to.contain('Team abonniert');
            expect(result).to.have.class('disabled');
        });
    });
}());