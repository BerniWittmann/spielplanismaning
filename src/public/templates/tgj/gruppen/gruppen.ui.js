(function () {
    'use strict';

    angular
        .module('spi.tgj.gruppen.ui', [
            'spi.auth', 'spi.gruppe', 'spi.tgj.gruppe.ui', 'ui.router', 'spi.gruppen.gruppenpanel.ui'
        ])
        .config(states)
        .controller('GruppenController', GruppenController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.tgj.gruppen', {
                url: '/gruppen',
                templateUrl: 'templates/tgj/gruppen/gruppen.html',
                controller: GruppenController,
                controllerAs: 'vm',
                resolve: {
                    gruppePromise: function (gruppe) {
                        return gruppe.getAll();
                    }
                }
            });

    }

    function GruppenController(gruppePromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            gruppen: gruppePromise.data
        });

        vm.loading = false;
    }
})();