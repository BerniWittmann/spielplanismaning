(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.gruppen.ui', [
            'spi.auth', 'spi.gruppe', 'spi.templates.tgj.gruppe.ui', 'ui.router', 'spi.components.gruppenpanel.ui'
        ])
        .config(states)
        .controller('GruppenController', GruppenController);

    function states($stateProvider) {
        //noinspection JSUnusedGlobalSymbols
        $stateProvider
            .state('spi.event.tgj.gruppen', {
                url: '/gruppen',
                templateUrl: 'templates/event/tgj/gruppen/gruppen.html',
                controller: GruppenController,
                controllerAs: 'vm',
                resolve: {
                    gruppen: function (aktivesEvent, gruppe) {
                        return gruppe.getAll();
                    }
                }
            });

    }

    function GruppenController(gruppen) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            gruppen: gruppen
        });

        vm.loading = false;
    }
})();