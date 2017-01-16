(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.teams.ui', [
            'spi.auth', 'ui.router', 'spi.team', 'spi.jugend', 'spi.components.jugendpanel.ui', 'spi.spielplan', 'spi.components.spielplan.ausnahmen.ui'
        ])
        .config(states)
        .controller('VerwaltungTeamsController', VerwaltungTeamsController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.verwaltung.teams', {
                url: '/teams',
                templateUrl: 'templates/verwaltung/teams/verwaltung.teams.html',
                controller: VerwaltungTeamsController,
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (jugend) {
                        return jugend.getAll();
                    },
                    teams: function (team) {
                        return team.getAll();
                    }
                },
                data: {
                    requiredRoles: ['bearbeiter', 'admin']
                }
            });

    }

    function VerwaltungTeamsController($scope, auth, jugend, spielplan, $timeout, $window, jugenden, teams, JUGEND_FARBEN) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: {},
            jugenden: jugenden,
            teams: teams,
            addJugend: function () {
                jugend.create(vm.jugend).then(function (res) {
                    spielplan.createSpielplan();
                    vm.jugend = {};
                    vm.jugenden.push(res);
                    $timeout(function () {
                        $scope.$apply();
                    }, 0, false);
                });
            },
            generateSpielplan: function () {
                spielplan.createSpielplan();
            },
            spielplanError: spielplan.error,
            isLoggedIn: auth.isAdmin(),
            farben: JUGEND_FARBEN
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