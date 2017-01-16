(function () {
    'use strict';

    angular
        .module('spi.templates.teamdeabonnieren.ui', [
            'spi.team', 'ui.router', 'spi.email'
        ])
        .config(states)
        .controller('TeamDeabonnierenController', TeamDeabonnierenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.team-deabonnieren', {
                url: '/teams/:teamid/deabonnieren',
                templateUrl: 'templates/team-deabonnieren/team-deabonnieren.html',
                controller: TeamDeabonnierenController,
                controllerAs: 'vm',
                resolve: {
                    aktivesTeam: function (team, $stateParams) {
                        return team.get($stateParams.teamid);
                    }
                }
            });

    }

    function TeamDeabonnierenController(aktivesTeam, email, $state, $timeout) {
        var vm = this;
        vm.loading = true;

        vm.team = aktivesTeam;
        vm.sub = {
            team: vm.team._id,
            email: ''
        };
        if (email.getSubscriptionByTeam({team: vm.team._id}).length === 1) {
            vm.sub.email = _.head(email.getSubscriptionByTeam({team: vm.team._id})).email;
        }

        function abbrechen() {
            vm.message = undefined;
            vm.abgemeldet = false;
            vm.abgebrochen = true;
        }

        function success() {
            vm.message = undefined;
            vm.abgemeldet = true;
            vm.abgebrochen = false;
        }

        vm.abbrechen = function () {
            abbrechen();
            redirect();
        };

        vm.abbestellen = function () {
            if (email.checkSubscription(vm.sub)) {
                email.removeSubscription(vm.sub).then(function () {
                    success();
                    redirect();
                }, function (err) {
                    console.log(err);
                    vm.message = vm.sub.email + ' kann nicht abgemeldet werden. Vielleicht ist diese Email bereits abgemeldet';
                });

            } else {
                vm.message = vm.sub.email + ' kann nicht abgemeldet werden. Vielleicht ist diese Email bereits abgemeldet';
            }
        };

        function redirect() {
            $timeout(function () {
                $state.go('spi.tgj.team', {
                    teamid: vm.team._id
                });
            }, 3000);
        }

        vm.loading = false;
    }
})
();