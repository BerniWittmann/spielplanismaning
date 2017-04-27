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
                    aktiveJugend: function (jugend, $stateParams) {
                        return jugend.get($stateParams.jugendid);
                    },
                    spiele: function (spiel, $stateParams) {
                        return spiel.getByJugend($stateParams.jugendid);
                    }
                }
            });

    }

    function JugendController(aktiveJugend, spiele) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: aktiveJugend,
            spiele: _.sortBy(spiele, ['nummer'])
        });

        vm.getGruppeKey = function (gruppe) {
            return gruppe.type === 'normal' ? 'gruppe' : 'zwischenGruppe';
        };

        vm.loading = false;
    }
})();