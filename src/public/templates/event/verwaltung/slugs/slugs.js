(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.slugs.ui', [
            'ui.router', 'ngTable', 'spi.jugend', 'spi.team', 'spi.gruppe'
        ])
        .config(states)
        .controller('SlugsContoller', SlugsContoller);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.event.verwaltung.slugs', {
                url: '/slugs',
                templateUrl: 'templates/event/verwaltung/slugs/slugs.html',
                controller: SlugsContoller,
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (aktivesEvent, jugend) {
                        return jugend.getAll();
                    },
                    gruppen: function (aktivesEvent, gruppe) {
                        return gruppe.getAll();
                    },
                    teams: function (aktivesEvent, team) {
                        return team.getAll();
                    }
                },
                data: {
                    requiredRoles: ['admin', 'bearbeiter']
                }
            });

    }

    function SlugsContoller(jugenden, gruppen, teams, NgTableParams, $state) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugenden: jugenden,
            gruppen: gruppen.map(function (single) {
                single.jugendName = single.jugend ? single.jugend.name : ''
                return single;
            }),
            teams: teams.map(function (single) {
                single.jugendName = single.jugend ? single.jugend.name : '';
                single.gruppenName = single.gruppe ? single.gruppe.name : '';
                single.zwGruppenName = single.zwischengruppe ? single.zwischengruppe.name : '';
                return single;
            }),
            gotoTeam: function (team) {
                $state.go('spi.event.tgj.team', {
                    teamid: team.slug || team._id
                });
            },
            gotoJugend: function (jugend) {
                $state.go('spi.event.tgj.jugend', {
                    jugendid: jugend.slug || jugend._id
                });
            },
            gotoGruppe: function (gruppe) {
                $state.go('spi.event.tgj.gruppe', {
                    gruppeid: gruppe.slug || gruppe._id
                });
            }
        });

        _.extend(vm, {
            tableParamsJugenden: tableParams(vm.jugenden),
            tableParamsGruppen: tableParams(vm.gruppen),
            tableParamsTeams: tableParams(vm.teams)
        });

        function tableParams(data) {
            return new NgTableParams({
                count: 10
            }, {
                counts: [],
                data: data
            });
        }

        vm.loading = false;
    }
})();