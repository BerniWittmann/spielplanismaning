(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.gruppe.ui', [
            'spi.auth', 'spi.gruppe', 'ui.router', 'spi.tabelle.ui', 'spi.spieletabelle.ui', 'spi.spiel'
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
                    gruppePromise: function (gruppe, $stateParams) {
                        return gruppe.get($stateParams.gruppeid);
                    }
                }
            });
    }

    function GruppeController(gruppePromise, spiel) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            gruppe: gruppePromise
        });
        spiel.getByGruppe(vm.gruppe._id, vm.gruppe.jugend._id).then(function (res) {
            vm.spiele = _.sortBy(res, ['nummer']);
            vm.loading = false;
        });
    }
})();