(function () {
    'use strict';

    angular
        .module('spi.gruppen.gruppenpanel.ui', [
            'spi.auth', 'ui.bootstrap', 'spi.panel.ui', 'spi.gruppe'
        ])
        .controller('GruppenPanelController', GruppenPanelController)
        .component('spiGruppenPanel', {
            templateUrl: 'components/gruppen-panel/gruppen-panel.html',
            bindings: {
                gruppe: '='
            },
            controller: 'GruppenPanelController',
            controllerAs: 'vm'
        });

    function GruppenPanelController() {
        var vm = this;
        
        _.extend(vm, {
            teams: _.sortBy(vm.gruppe.teams, 'name')
        });
    }

})();