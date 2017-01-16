(function () {
    'use strict';

    angular
        .module('spi.templates.spiel.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('SpielController', SpielController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.spiel', {
                url: '/spiel/:spielid',
                templateUrl: 'templates/spiel/spiel.html',
                controller: SpielController,
                controllerAs: 'vm',
                resolve: {
                    spiel: function (spiel, $stateParams) {
                        return spiel.get($stateParams.spielid);
                    }
                }
            });

    }

    function SpielController($state, spiel) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiel: spiel,
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
        });

        vm.loading = false;
    }
})();