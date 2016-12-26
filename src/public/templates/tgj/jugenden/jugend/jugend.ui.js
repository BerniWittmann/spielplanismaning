(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.jugend.ui', [
            'spi.jugend', 'ui.router', 'spi.components.gruppenpanel.ui', 'spi.spiel', 'spi.components.jugendlabel.ui'
        ])
        .config(states)
        .controller('JugendController', JugendController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.jugend', {
                url: '/jugenden/:jugendid',
                templateUrl: 'templates/tgj/jugenden/jugend/jugend.html',
                controller: JugendController,
                controllerAs: 'vm',
                resolve: {
                    jugendPromise: function (jugend, $stateParams) {
                        return jugend.get($stateParams.jugendid);
                    },
                    spielPromise: function (spiel, $stateParams) {
                        return spiel.getByJugend($stateParams.jugendid);
                    }
                }
            });

    }

    function JugendController(jugendPromise, spielPromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: jugendPromise,
            spiele: _.sortBy(spielPromise, ['nummer'])
        });

        vm.loading = false;
    }
})();