(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.teams.ui', [
            'spi.team', 'spi.templates.tgj.team.ui', 'ui.router', 'ngTable'
        ])
        .config(states)
        .controller('TeamsController', TeamsController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.teams', {
                url: '/teams',
                templateUrl: 'templates/tgj/teams/teams.html',
                controller: TeamsController,
                controllerAs: 'vm',
                resolve: {
                    teams: function (team) {
                        return team.getAll();
                    }
                }
            });

    }

    function TeamsController($state, teams, NgTableParams) {
        const vm = this;
        vm.loading = true;
        _.extend(vm, {
            teams: teams,
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            },
            gotoGruppe: function (gruppe) {
                $state.go('spi.tgj.gruppe', {
                    gruppeid: gruppe._id
                });
            },
            gotoJugend: function (jugend) {
                $state.go('spi.tgj.jugend', {
                    jugendid: jugend._id
                });
            }
        });

        _.forEach(vm.teams, function (o) {

        });
        
        vm.teams = _.sortBy(vm.teams, ['jugendName', 'gruppenName', 'name']).filter(function(single) {
            return !single.isPlaceholder;
        }).map(function (o) {
            o.jugendName = o.jugend ? o.jugend.name: '';
            o.gruppenName = o.gruppe ? o.gruppe.name : '';
            if (o.ergebnisse && o.ergebnisse.all) {
                const results = o.ergebnisse.all;
                o.tore = results.tore;
                o.gtore = results.gtore;
                o.punkte = results.punkte;
                o.gpunkte = results.gpunkte;
                o.spiele = results.spiele;
            }
            o.tordiff = o.tore - o.gtore;
            return o;
        });
        
        _.extend(vm, {
            tableParams: new NgTableParams({
                count: 10
            }, {
                counts: []
                , data: vm.teams
            })
        });
        
        vm.loading = false;
    }
})
();