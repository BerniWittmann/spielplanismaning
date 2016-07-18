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
                url: '/spiel/:spielid'
                , templateUrl: 'templates/spiel/spiel.html'
                , controller: SpielController
                , controllerAs: 'vm'
            });

    }

    function SpielController($stateParams, $state, spiel) {
        var vm = this;
        vm.loading = true;

        spiel.get($stateParams.spielid).then(function (response) {
            vm.spiel = response;
            vm.loading = false;
        });

        _.extend(vm, {
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
        })
    }
})();