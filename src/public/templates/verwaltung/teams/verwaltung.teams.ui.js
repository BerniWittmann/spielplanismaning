(function () {
    'use strict';

    angular
        .module('spi.verwaltung.teams.ui', [
            'spi.auth', 'ui.router', 'spi.gruppe', 'spi.jugend', 'spi.verwaltung.teams.jugendpanel.ui', 'spi.spielplan', 'spi.spielplan.ausnahmen.ui'
        ])
        .config(states)
        .controller('VerwaltungTeamsController', VerwaltungTeamsController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.verwaltung.teams', {
                url: '/teams'
                , templateUrl: 'templates/verwaltung/teams/verwaltung.teams.html'
                , controller: VerwaltungTeamsController
                , controllerAs: 'vm'
                , resolve: {
                    authenticate: authenticate,
                    jugendPromise: function (jugend) {
                        return jugend.getAll();
                    },
                    teamPromise: function (team) {
                        return team.getAll();
                    }
                }
            });

    }

    function authenticate($q, auth, $state, $timeout) {
        if (auth.canAccess(1)) {
            return $q.when();
        } else {
            $timeout(function () {
                $state.go('spi.login');
            });

            return $q.reject();
        }
    }

    function VerwaltungTeamsController($scope, auth, jugend, spielplan, $timeout, $window, jugendPromise, teamPromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: {},
            jugenden: jugendPromise.data,
            teams: teamPromise.data,
            addJugend: function () {
                jugend.create(vm.jugend).then(function (res) {
                    spielplan.createSpielplan();
                    vm.jugend = {};
                    vm.jugenden.push(res.data);
                    $timeout(function () {
                        $scope.$apply();
                    }, 0, false);
                });
            },
            spielplanError: spielplan.error,
            isLoggedIn: auth.canAccess(1),
            farben: [
                {
                    name: 'Grün'
                    , wert: 'gruen'
                }

                , {
                    name: 'Gelb'
                    , wert: 'gelb'
                }

                , {
                    name: 'Rot'
                    , wert: 'rot'
                }

                , {
                    name: 'Blau'
                    , wert: 'blau'
                }

                , {
                    name: 'Orange'
                    , wert: 'orange'
                }

                , {
                    name: 'Lila'
                    , wert: 'lila'
                }

                , {
                    name: 'Hellblau'
                    , wert: 'hellblau'
                }

                , {
                    name: 'Hellgrün'
                    , wert: 'hellgruen'
                }

                , {
                    name: 'Hellrot'
                    , wert: 'hellrot'
                }
            ]
        });

        $scope.$watch(function () {
            return spielplan.error;
        }, function () {
            vm.spielplanError = spielplan.error;
            if(spielplan.error) {
                $window.scrollTo(0, 0);
            }
        });

        vm.loading = false;
    }
})();