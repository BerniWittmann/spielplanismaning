(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.jugend.ui', [
            'spi.jugend', 'ui.router', 'spi.components.gruppenpanel.ui', 'spi.spiel', 'spi.components.jugendlabel.ui', 'spi.gruppe'
        ])
        .config(states)
        .controller('JugendController', JugendController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.jugend', {
                url: '/turniere/:jugendid',
                templateUrl: 'templates/tgj/jugenden/jugend/jugend.html',
                controller: JugendController,
                controllerAs: 'vm',
                resolve: {
                    aktiveJugend: function (jugend, $stateParams) {
                        return jugend.getBySlugOrID($stateParams.jugendid);
                    },
                    spiele: function (spiel, aktiveJugend) {
                        return spiel.getByJugend(aktiveJugend._id);
                    },
                    gruppen: function (gruppe, aktiveJugend) {
                        return gruppe.getByJugend(aktiveJugend._id);
                    }
                }
            });

    }

    function JugendController(aktiveJugend, spiele, gruppen) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            jugend: aktiveJugend,
            spiele: _.sortBy(spiele, ['nummer']),
            gruppen: gruppen
        });

        vm.getGruppeKey = function (gruppe) {
            return gruppe.type === 'normal' ? 'gruppe' : 'zwischenGruppe';
        };

        vm.loading = false;
    }
})();