(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.teams.ui', [
            'spi.auth', 'ui.router', 'spi.team', 'spi.jugend', 'spi.components.jugendpanel.ui', 'spi.spielplan'
        ])
        .config(states)
        .controller('VerwaltungTeamsController', VerwaltungTeamsController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.verwaltung.teams', {
                url: '/teams',
                templateUrl: 'templates/event/verwaltung/teams/verwaltung.teams.html',
                controller: VerwaltungTeamsController,
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (aktivesEvent, jugend) {
                        return jugend.getAll();
                    },
                    teams: function (aktivesEvent, team) {
                        return team.getAll();
                    }
                },
                data: {
                    requiredRoles: ['bearbeiter', 'admin']
                }
            });

    }

    function VerwaltungTeamsController($scope, auth, jugend, spielplan, $timeout, jugenden, teams, JUGEND_FARBEN, team) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: {},
            jugenden: jugenden,
            teams: teams,
            addJugend: function (form) {
                if (form.$valid) {
                    form.$setUntouched();
                    jugend.create(vm.jugend).then(function (res) {
                        form.$setUntouched();
                        spielplan.createSpielplan();
                        vm.jugend = {};
                        vm.jugenden.push(res);
                        $timeout(function () {
                            $scope.$apply();
                        }, 0, false);
                    });
                }
            },
            isLoggedIn: auth.isAdmin(),
            farben: JUGEND_FARBEN,
            refreshAnmeldeObjects: team.reloadAnmeldeObjekte
        });

        $scope.$on('jugendDeleted', function () {
           jugend.getAll().then(function (res) {
               vm.jugenden = res;
           });
        });

        vm.loading = false;
    }
})();