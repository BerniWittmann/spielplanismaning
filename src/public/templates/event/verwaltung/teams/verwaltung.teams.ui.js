(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.teams.ui', [
            'spi.auth', 'ui.router', 'spi.team', 'spi.jugend', 'spi.components.jugendpanel.ui', 'spi.spielplan', 'spi.anmeldung', 'spi.components.turnier-import-modal.ui'
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
                    },
                    turniere: function (anmeldung) {
                        return anmeldung.getSingleTurniere();
                    }
                },
                data: {
                    requiredRoles: ['bearbeiter', 'admin']
                }
            });

    }

    function VerwaltungTeamsController($scope, auth, jugend, spielplan, $timeout, jugenden, teams, JUGEND_FARBEN, team, turniere, TurnierImportDialog) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: {},
            jugenden: jugenden,
            teams: teams,
            addJugend: function (form) {
                console.log()
                if (form.$valid) {
                    form.$setUntouched();

                    TurnierImportDialog.open(vm.jugend, vm.imported).result.then(function (res) {
                        vm.jugenden.push(res);
                    });
                }
            },
            isLoggedIn: auth.isAdmin(),
            farben: JUGEND_FARBEN,
            refreshAnmeldeObjects: team.reloadAnmeldeObjekte,
            turniere: turniere,
            imported: undefined,
            handleChange: function () {
                if (vm.imported) {
                    vm.jugend.name = vm.imported.name;
                } else {
                    vm.imported = undefined;
                    vm.jugend.name = undefined;
                }
            }
        });

        $scope.$on('jugendDeleted', function () {
           jugend.getAll().then(function (res) {
               vm.jugenden = res;
           });
        });

        vm.loading = false;
    }
})();