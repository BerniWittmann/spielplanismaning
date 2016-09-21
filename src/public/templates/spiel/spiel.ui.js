(function () {
    'use strict';

    angular
        .module('spi.spiel.ui', [
            'spi.auth', 'ui.router', 'spi.spiel'
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
                    spielPromise: function (spiel, $stateParams) {
                        return spiel.get($stateParams.spielid);
                    }
                }
            });

    }

    function SpielController($state, spielPromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            spiel: spielPromise,
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
        });

        vm.loading = false;
    }
})();