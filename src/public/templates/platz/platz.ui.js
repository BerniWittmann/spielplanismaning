(function () {
    'use strict';

    angular
        .module('spi.templates.platz.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('PlatzController', PlatzController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.platz', {
                url: '/platz/:platznummer',
                templateUrl: 'templates/platz/platz.html',
                controller: PlatzController,
                controllerAs: 'vm',
                resolve: {
                    spielPromise: function (spiel) {
                        return spiel.getAll();
                    }
                }
            });
    }

    function PlatzController(spielPromise, $stateParams) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            platz: $stateParams.platznummer,
            spiele: _.sortBy(_.filter(spielPromise.data, {platz: parseInt($stateParams.platznummer)}), ['nummer'])
        });
        vm.loading = false;
    }
})();