(function () {
    'use strict';

    angular
        .module('spi.components.panel.ui', [
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

    function PanelController() {}
})();