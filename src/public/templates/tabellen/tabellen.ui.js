(function () {
    'use strict';

    angular
        .module('spi.tabellen.ui', [
            'spi.auth', 'spi.jugend', 'ui.router', 'spi.tabelle.ui'
        ])
        .config(states)
        .controller('TabellenController', TabellenController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tabellen', {
                url: '/tabellen',
                templateUrl: 'templates/tabellen/tabellen.html',
                controller: TabellenController,
                controllerAs: 'vm',
                resolve: {
                    jugendPromise: function (jugend) {
                        return jugend.getAll();
                    },
                    jugendTorePromise: function (jugend) {
                        return jugend.getGesamtTore();
                    }
                }
            });

    }

    function TabellenController(jugend, jugendPromise, jugendTorePromise) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            gesamt: jugendTorePromise.data,
            jugenden: jugendPromise.data
        });
        _.forEach(vm.jugenden, function (jgd) {
            if (!_.isUndefined(jgd) && !_.isNull(jgd)) {
                jugend.getTore(jgd._id).then(function (res) {
                    if (res.data >= 0) {
                        jgd.tore = res.data;
                    } else {
                        jgd.tore = 0;
                    }
                });
            }
        });
        
        vm.loading = false;
    }
})();