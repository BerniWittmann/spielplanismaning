(function () {
    'use strict';

    angular
        .module('spi.tabellen.ui', [
            'spi.auth', 'spi.gruppe', 'spi.jugend', 'ui.router', 'spi.tabelle.ui'
        ])
        .config(states)
        .controller('TabellenController', TabellenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tabellen', {
                url: '/tabellen'
                , templateUrl: 'templates/tabellen/tabellen.html'
                , controller: TabellenController
                , controllerAs: 'vm'
            });

    }

    function TabellenController(gruppe, jugend, $stateParams) {
        var vm = this;
        vm.loading = true;
        vm.gesamt = 0;

        jugend.getAll().then(function (res) {
            vm.jugenden = res.data;
            _.forEach(vm.jugenden, function (jgd) {
                if (!_.isUndefined(jgd) && !_.isNull(jgd)) {
                    jugend.getTore(jgd._id).then(function (res) {
                        if (res.data >= 0) {
                            jgd.tore = res.data;
                        } else {
                            jgd.tore = 0;
                        }
                        vm.gesamt += jgd.tore;
                    });
                }
            });
            vm.loading = false;
        });
    }
})();