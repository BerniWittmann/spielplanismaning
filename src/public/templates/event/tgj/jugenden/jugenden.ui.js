(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.jugenden.ui', [
            'spi.jugend', 'ui.router', 'spi.components.jugendpanel.ui', 'spi.templates.tgj.jugend.ui'
        ])
        .config(states)
        .controller('JugendenController', JugendenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.tgj.jugenden', {
                url: '/turniere',
                templateUrl: 'templates/event/tgj/jugenden/jugenden.html',
                controller: 'JugendenController',
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (aktivesEvent, jugend) {
                        return jugend.getAll();
                    }
                }
            });

    }

    function JugendenController(jugenden) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugenden: jugenden
        });

        vm.loading = false;
    }
})();