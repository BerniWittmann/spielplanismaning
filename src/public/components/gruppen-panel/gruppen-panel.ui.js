(function () {
    'use strict';

    angular
        .module('spi.components.gruppenpanel.ui', [
            'ui.bootstrap', 'spi.components.panel.ui'
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