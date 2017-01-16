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
            .state('spi.tgj.jugenden', {
                url: '/jugenden',
                templateUrl: 'templates/tgj/jugenden/jugenden.html',
                controller: 'JugendenController',
                controllerAs: 'vm',
                resolve: {
                    jugenden: function (jugend) {
                        return jugend.getAll();
                    }
                }
            });

    }

    function JugendenController(jugenden) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugenden: jugenden
        });

        vm.loading = false;
    }
})();