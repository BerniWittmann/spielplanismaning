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
                var options = {
                    clockFace: 'MinuteCounter',
                    autoPlay: false
                };
                _.extend(options, scope.$eval(attrs.flipcounter));
                var scoreA = scope.$eval(attrs.scorea);
                var scoreB = scope.$eval(attrs.scoreb);
                var time = 60 * scoreA + scoreB;

                var start = time - scoreB - 1;
                if (start < 0) {
                    start = 0;
                }
                var clock = $(element).FlipClock(start, options);
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

    function SpielController($state, aktivesSpiel) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiel: aktivesSpiel,
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
        });

        vm.loading = false;
    }
})();