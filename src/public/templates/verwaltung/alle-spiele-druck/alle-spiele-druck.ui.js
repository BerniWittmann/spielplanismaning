(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.spiele-druck.ui', [
            'ui.router', 'spi.spiel', 'spi.auth'
        ])
        .config(states)
        .controller('SpieleDruckController', SpieleDruckController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.verwaltung.spiele-druck', {
                url: '/spiele-druck',
                templateUrl: 'templates/verwaltung/alle-spiele-druck/alle-spiele-druck.html',
                controller: SpieleDruckController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (spiel) {
                        return spiel.getAll();
                    }
                },
                data: {
                    requiredRoles: ['bearbeiter', 'admin']
                }
            });

    }

    function SpieleDruckController($state, spiele, spiel) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiele: _.sortBy(_.filter(spiele, function (spiel) {
                return spiel.teamA || spiel.teamB || spiel.fromA || spiel.fromB;
            }), ['platz', 'nummer']),
            gotoTeam: function (gewaehltesteam) {
                if (gewaehltesteam && gewaehltesteam.name) {
                    $state.go('spi.tgj.team', {
                        teamid: gewaehltesteam._id
                    });
                }
            },
            gotoGruppe: function (gewaehltegruppe) {
                if (gewaehltegruppe) {
                    $state.go('spi.tgj.gruppe', {
                        gruppeid: gewaehltegruppe._id
                    });
                }
            },
            displayGruppe: function (game) {
                return spiel.getGruppeDisplay(game);
            },
            displayTeamA: function(game) {
                return spiel.getTeamDisplay(game, 'A');
            },
            displayTeamB: function(game) {
                return spiel.getTeamDisplay(game, 'B');
            }
        });

        vm.loading = false;
    }
})();