(function () {
    'use strict';

    angular
        .module('spi.loader.ui', [])
        .controller('LoaderController', LoaderController)
        .component('spiLoader', {
            templateUrl: 'components/loader/loader.html'
            , bindings: {
                loading: '='
            }
            , controller: 'LoaderController'
            , controllerAs: 'vm'
        });

    function LoaderController() {
    }

})();