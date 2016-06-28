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

    function JugendLabelController($state) {
        var vm = this;

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            gotoJugend: function () {
                $state.go('spi.tgj.jugend', {
                    jugendid: vm.jugend._id
                });
            }
        });
    }

})();