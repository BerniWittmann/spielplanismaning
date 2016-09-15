(function () {
    'use strict';

    angular
        .module('spi.gruppen.gruppenpanel.ui', [
            'spi.auth', 'ui.bootstrap', 'spi.panel.ui', 'spi.gruppe'
        ])
        .controller('GruppenPanelController', GruppenPanelController)
        .component('spiGruppenPanel', {
            templateUrl: 'components/gruppen-panel/gruppen-panel.html'
            , bindings: {
                gruppe: '='
            }
            , controller: 'GruppenPanelController'
            , controllerAs: 'vm'
        });

    function GruppenPanelController(gruppe) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            teams: []
        });

        getGruppe();

        function getGruppe() {
            gruppe.get(vm.gruppe._id).then(function (res) {
                vm.gruppe = res;
                vm.teams = _.sortBy(res.teams, 'name');
                vm.loading = false;
            })
        }
    }

})();