(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.team.ui', [
            'spi.email', 'spi.team', 'ui.router', 'spi.spiel', 'spi.components.team-abonnieren-modal.ui', 'spi.gruppe'
        ])
        .config(states)
        .controller('TeamController', TeamController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.tgj.team', {
                url: '/teams/:teamid',
                templateUrl: 'templates/event/tgj/teams/team/team.html',
                controller: TeamController,
                controllerAs: 'vm',
                resolve: {
                    aktivesTeam: function (aktivesEvent, team, $stateParams) {
                        return team.getBySlugOrID($stateParams.teamid);
                    },
                    spiele: function (aktivesEvent, spiel, aktivesTeam) {
                        return spiel.getByTeam(aktivesTeam._id);
                    }
                }
            });

    }

    function TeamController(aktivesTeam, spiele, TeamAbonnierenDialog, email, $state, toastr, gruppe) {
        const vm = this;
        vm.loading = true;

        if (!aktivesTeam.name) {
            toastr.error('Team nicht gefunden');
            $state.go('spi.event.home');
            return;
        }

        _.extend(vm, {
            team: aktivesTeam,
            bereitsAbonniert: email.checkSubscription({
                team: aktivesTeam._id
            }),
            spiele: _.sortBy(spiele, ['nummer']),
            abonnieren: abonnieren
        });
        gruppe.get(aktivesTeam.gruppe._id).then(function (res) {
            vm.teams = res.teamTabelle;
            if (aktivesTeam.zwischengruppe && aktivesTeam.zwischengruppe._id) {
                return gruppe.get(aktivesTeam.zwischengruppe._id).then(function (res) {
                    vm.zwischengruppenTeams = res.teamTabelle.filter(function (single) {
                        return !single.isPlaceholder;
                    });
                    vm.loading = false;
                });
            }
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