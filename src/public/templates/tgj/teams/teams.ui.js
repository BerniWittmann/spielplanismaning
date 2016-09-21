(function () {
    'use strict';

    angular
        .module('spi.tgj.teams.ui', [
            'spi.auth', 'spi.team', 'spi.tgj.team.ui', 'ui.router', 'ngTable'
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
                    teamPromise: function (team) {
                        return team.getAll();
                    }
                }
            });

    }

    function TeamsController($state, teamPromise, NgTableParams) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            teams: teamPromise.data,
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
            o.jugendName = o.jugend.name;
            o.gruppenName = o.gruppe.name;
            o.tordiff = o.tore - o.gtore;
        });
        
        vm.teams = _.sortBy(vm.teams, ['jugendName', 'gruppenName', 'name']);
        
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