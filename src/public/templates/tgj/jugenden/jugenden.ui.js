(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.jugenden.ui', [
            'spi.jugend', 'ui.router', 'spi.verwaltung.teams.jugendpanel.ui', 'spi.templates.tgj.jugend.ui'
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
                    jugendPromise: function (jugend) {
                        return jugend.getAll();
                    }
                }
            });

    }

    function JugendenController(jugendPromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugenden: jugendPromise.data
        });

        vm.loading = false;
    }
})();