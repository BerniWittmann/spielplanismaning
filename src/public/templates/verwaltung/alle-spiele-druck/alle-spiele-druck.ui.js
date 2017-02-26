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

    function SpieleDruckController($state, spiele) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiele: _.sortBy(_.filter(spiele, function (spiel) {
                return !_.isUndefined(spiel.teamA) && !_.isUndefined(spiel.teamB);
            }), ['platz', 'nummer']),
            gotoTeam: function (gewaehltesteam) {
                if (gewaehltesteam) {
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
            }
        });

        vm.loading = false;
    }
})();