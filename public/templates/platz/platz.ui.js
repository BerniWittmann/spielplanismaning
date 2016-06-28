(function () {
    'use strict';

    angular
        .module('spi.platz.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('PlatzController', PlatzController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.platz', {
                url: '/platz/:platznummer'
                , templateUrl: 'templates/platz/platz.html'
                , controller: PlatzController
                , controllerAs: 'vm'
            });

    }

    function PlatzController($state, spiel, $stateParams) {
        var vm = this;
        vm.loading = true;
        vm.spiele = [];
        vm.platz = $stateParams.platznummer;

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            gotoSpiel: function (gewaehltesspiel) {
                if (gewaehltesspiel.jugend) {
                    $state.go('spi.spiel', {
                        spielid: gewaehltesspiel._id
                    });
                }
            }
        });

        spiel.getAll().then(function (res) {
            vm.spiele = _.sortBy(_.filter(res.data, {platz: parseInt(vm.platz)}), ['nummer']);
            vm.loading = false;
        });
    }
})();