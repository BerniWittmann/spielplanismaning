(function () {
    'use strict';

    angular
        .module('spi.templates.tabellen.ui', [
            'ui.router', 'spi.components.tabelle.ui', 'spi.jugend'
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
                    jugenden: function (jugend) {
                        return jugend.getAll();
                    },
                    jugendTore: function (jugend) {
                        return jugend.getGesamtTore();
                    }
                }
            });

    }

    function TabellenController(jugend, jugenden, jugendTore) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            gesamt: jugendTore,
            jugenden: jugenden
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