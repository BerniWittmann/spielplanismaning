(function () {
    'use strict';

    angular
        .module('spi.tgj.team.ui', [
            'spi.auth', 'spi.team', 'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('TeamController', TeamController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.team', {
                url: '/teams/:teamid',
                templateUrl: 'templates/tgj/teams/team/team.html',
                controller: TeamController,
                controllerAs: 'vm',
                resolve: {
                    teamPromise: function (team, $stateParams) {
                        return team.get($stateParams.teamid);
                    },
                    spielPromise: function (spiel, $stateParams) {
                        return spiel.getByTeam($stateParams.teamid);
                    }
                }
            });

    }

    function TeamController(teamPromise, spielPromise, TeamAbonnierenDialog, email, team) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            team: teamPromise,
            bereitsAbonniert: email.checkSubscription({
                team: teamPromise._id
            }),
            spiele: _.sortBy(spielPromise, ['nummer']),
            abonnieren: abonnieren
        });
        team.getByGruppe(vm.team.gruppe._id, vm.team.jugend._id).then(function (res) {
            vm.teams = res;
            vm.loading = false;
        });

        function abonnieren() {
            return TeamAbonnierenDialog.open(vm.team).closed.then(function () {
                vm.bereitsAbonniert = email.checkSubscription({
                    team: vm.team._id
                });
            });
        }
    }
})();