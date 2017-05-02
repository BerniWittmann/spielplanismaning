(function () {
    'use strict';

    angular
        .module('spi.templates.tabellen.ui', [
            'ui.router', 'spi.components.tabelle.ui', 'spi.jugend', 'spi.gruppe'
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
                    },
                    gruppen: function (gruppe) {
                        return gruppe.getAll();
                    }
                }
            });

    }

    function TabellenController(jugend, jugenden, jugendTore, gruppen) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            gesamt: jugendTore,
            jugenden: jugenden.map(function (jgd) {
                jgd.gruppen = gruppen.filter(function(single) {
                    return single.jugend._id.toString() === jgd._id.toString();
                });
                return jgd;
            }),
            calcTableWidth: function (jugend) {
                return 6;
            },
            getResultKey: function (gruppe) {
                return gruppe.type !== 'normal' ? 'zwischenGruppe' : 'gruppe';
            }
        });

        _.forEach(vm.jugenden, function (jgd) {
            if (!_.isUndefined(jgd) && !_.isNull(jgd)) {
                jugend.getTore(jgd._id).then(function (res) {
                    if (res >= 0) {
                        jgd.tore = res;
                    } else {
                        jgd.tore = 0;
                    }
                });
            }
        });
        
        vm.loading = false;
    }
})();