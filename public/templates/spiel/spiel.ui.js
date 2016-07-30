(function () {
    'use strict';

    angular
        .module('spi.spiel.ui', [
            'spi.auth', 'ui.router', 'spi.spiel', 'angular-timeline', 'angular-scroll-animate'
        ])
        .config(states)
        .controller('SpielController', SpielController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spiel', {
                url: '/spiel/:spielid'
                , templateUrl: 'templates/spiel/spiel.html'
                , controller: SpielController
                , controllerAs: 'vm'
            });

    }

    function SpielController($stateParams, $state, spiel, $timeout, $scope) {
        var vm = this;
        vm.loading = true;

        spiel.get($stateParams.spielid).then(function (response) {
            vm.spiel = response;
            vm.loading = false;
            vm.events = [
                {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamA.name + ' hat 1 Punkt gemacht',
                    side: 'left'
                }, {
                    badgeClass: 'warning',
                    badgeIconClass: 'fa-ban',
                    title: 'Hinausstellung',
                    content: vm.spiel.teamB.name + ' hat eine Hinausstellung bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamB.name + ' hat 2 Punkte gemacht',
                    side: 'right'
                }, {
                    badgeClass: 'danger',
                    badgeIconClass: 'fa-ban',
                    title: 'Disqualifikation',
                    content: vm.spiel.teamB.name + ' hat eine Disqualifikation bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamA.name + ' hat 1 Punkt gemacht',
                    side: 'left'
                }, {
                    badgeClass: 'warning',
                    badgeIconClass: 'fa-ban',
                    title: 'Hinausstellung',
                    content: vm.spiel.teamB.name + ' hat eine Hinausstellung bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamB.name + ' hat 2 Punkte gemacht',
                    side: 'right'
                }, {
                    badgeClass: 'danger',
                    badgeIconClass: 'fa-ban',
                    title: 'Disqualifikation',
                    content: vm.spiel.teamB.name + ' hat eine Disqualifikation bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamA.name + ' hat 1 Punkt gemacht',
                    side: 'left'
                }, {
                    badgeClass: 'warning',
                    badgeIconClass: 'fa-ban',
                    title: 'Hinausstellung',
                    content: vm.spiel.teamB.name + ' hat eine Hinausstellung bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamB.name + ' hat 2 Punkte gemacht',
                    side: 'right'
                }, {
                    badgeClass: 'danger',
                    badgeIconClass: 'fa-ban',
                    title: 'Disqualifikation',
                    content: vm.spiel.teamB.name + ' hat eine Disqualifikation bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamA.name + ' hat 1 Punkt gemacht',
                    side: 'left'
                }, {
                    badgeClass: 'warning',
                    badgeIconClass: 'fa-ban',
                    title: 'Hinausstellung',
                    content: vm.spiel.teamB.name + ' hat eine Hinausstellung bekommen',
                    side: 'right'
                }, {
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamB.name + ' hat 2 Punkte gemacht',
                    side: 'right'
                }, {
                    badgeClass: 'danger',
                    badgeIconClass: 'fa-ban',
                    title: 'Disqualifikation',
                    content: vm.spiel.teamB.name + ' hat eine Disqualifikation bekommen',
                    side: 'right'
                }
            ];

            $timeout(function () {
                vm.events.unshift({
                    badgeClass: 'info',
                    badgeIconClass: 'fa-futbol-o',
                    title: 'Tor',
                    content: vm.spiel.teamA.name + ' hat 1 Punkt gemacht',
                    side: 'right'
                });
            }, 5000);
        });

        _.extend(vm, {
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
        });

        $scope.animateElementIn = function ($el) {
            $el.removeClass('hidden fadeOutUp');
            $el.addClass('animated fadeInDown'); // this example leverages animate.css classes
        };

        $scope.animateElementOut = function ($el) {
            $el.removeClass('fadeInDown');
            $el.addClass('fadeOutUp');
        };

        $scope.showBody = function (event) {
            var el = angular.element(event.target).find('span');
            angular.element(event.target).removeClass('timeline-header-only');
            el.removeClass('hidden');
        };

        $scope.hideBody = function (event) {
            angular.element(event.target).addClass('timeline-header-only');
            var els = angular.element(document).find('timeline-panel').find('span');
            _.forEach(els, function (el) {
                angular.element(el).addClass('hidden');
            });
        };
    }
})();