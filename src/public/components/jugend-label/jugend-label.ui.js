(function () {
    'use strict';

    angular
        .module('spi.jugenden.jugendlabel.ui', [
            'spi.auth', 'ui.bootstrap'
        ])
        .controller('JugendLabelController', JugendLabelController)
        .component('spiJugendLabel', {
            templateUrl: 'components/jugend-label/jugend-label.html'
            , bindings: {
                jugend: '='
            }
            , controller: 'JugendLabelController'
            , controllerAs: 'vm'
        });

    function JugendLabelController() {}

})();