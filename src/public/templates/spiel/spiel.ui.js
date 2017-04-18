(function () {
    'use strict';

    angular
        .module('spi.templates.spiel.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('SpielController', SpielController)
        .directive('flipcounter', flipcounter);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spiel', {
                url: '/spiel/:spielid',
                templateUrl: 'templates/spiel/spiel.html',
                controller: SpielController,
                controllerAs: 'vm',
                resolve: {
                    aktivesSpiel: function (spiel, $stateParams) {
                        return spiel.get($stateParams.spielid);
                    }
                }
            });

    }

    function flipcounter() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                const options = {
                    clockFace: 'MinuteCounter',
                    autoPlay: false
                };
                _.extend(options, scope.$eval(attrs.flipcounter));
                const scoreA = scope.$eval(attrs.scorea);
                const scoreB = scope.$eval(attrs.scoreb);
                const time = 60 * scoreA + scoreB;

                let start = time - scoreB - 1;
                if (start < 0) {
                    start = 0;
                }
                const clock = $(element).FlipClock(start, options);
                clock.stop();
                if (scoreA > 0) {
                    clock.flip();
                }
                if (time > 0 && scoreB > 0) {
                    clock.setTime(time - 1);
                }
                if (scoreB > 0) {
                    clock.flip();
                }
            }
        }
    }

    function SpielController($state, aktivesSpiel, spiel) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiel: aktivesSpiel,
            gotoTeam: function (team) {
                if (team) {
                    $state.go('spi.tgj.team', {
                        teamid: team._id
                    });
                }
            },
            displayGruppe: function () {
                return spiel.getGruppeDisplay(aktivesSpiel);
            },
            displayTeamA: function() {
                return spiel.getTeamDisplay(aktivesSpiel, 'A');
            },
            displayTeamB: function() {
                return spiel.getTeamDisplay(aktivesSpiel, 'B');
            }
        });

        vm.loading = false;
    }
})();