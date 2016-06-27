(function () {
    'use strict';

    angular
        .module('spi.panel.ui', [
            'ui.bootstrap'
        ])
        .controller('PanelController', PanelController)
        .component('spiPanel', {
            templateUrl: 'components/panel/panel.html'
            , transclude: {
                titel: 'spiPanelTitel'
            }
            , controller: 'PanelController'
            , controllerAs: 'vm'
        });

    function PanelController() {
        var vm = this;
    }
})();