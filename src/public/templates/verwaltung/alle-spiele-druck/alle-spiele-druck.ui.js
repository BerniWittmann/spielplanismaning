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

    function SpieleDruckController($state, spiele, spiel, $scope) {
        const vm = this;
        vm.loading = true;

        vm.mode = 'all';
        _.extend(vm, {
            spiele: getSpiele(spiele),
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

        function getSpiele(games) {
            return _.sortBy(_.filter(games, function (spiel) {
                if (vm.mode !== 'all' && spiel.beendet) {
                    return false;
                }
                return spiel.teamA || spiel.teamB || spiel.fromA || spiel.fromB;
            }), ['platz', 'nummer'])
        }

        $scope.$watch('vm.mode', function () {
            vm.spiele = getSpiele(spiele);
        });

        vm.loading = false;
    }
})();