(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.gruppe.ui', [
            'spi.auth', 'spi.gruppe', 'ui.router', 'spi.components.tabelle.ui', 'spi.components.spieletabelle.ui', 'spi.spiel'
        ])
        .config(states)
        .controller('GruppeController', GruppeController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.tgj.gruppe', {
                url: '/gruppen/:gruppeid',
                templateUrl: 'templates/tgj/gruppen/gruppe/gruppe.html',
                controller: GruppeController,
                controllerAs: 'vm',
                resolve: {
                    aktiveGruppe: function (gruppe, $stateParams) {
                        return gruppe.get($stateParams.gruppeid);
                    },
                    spiele: function (spiel, aktiveGruppe) {
                        return spiel.getByGruppe(aktiveGruppe._id, aktiveGruppe.jugend._id);
                    },
                    teams: function (team, $stateParams) {
                        return team.getByGruppe($stateParams.gruppeid);
                    }
                }
            });
    }

    function GruppeController(aktiveGruppe, spiele, teams) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            gruppe: aktiveGruppe,
            teams: teams,
            key: aktiveGruppe.type === 'normal' ? 'gruppe' : 'zwischenGruppe'
        });

        vm.spiele = _.sortBy(spiele, ['nummer']);
        vm.loading = false;
    }
})();