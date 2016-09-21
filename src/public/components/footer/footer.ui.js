(function () {
    'use strict';

    angular
        .module('spi.footer.ui', ['spi.config'])
        .directive('spiFooter', spiFooter)
        .controller('FooterController', FooterController);

    function spiFooter() {
        //noinspection JSUnusedGlobalSymbols
        return {
            restrict: 'E',
            templateUrl: 'components/footer/footer.html',
            scope: true,
            controller: FooterController,
            controllerAs: 'vm'
        }
    }

    function FooterController(config) {
        var vm = this;

        config.getEnv().then(function (res) {
            _.extend(vm, {
                showBuildStatus: _.isEqual(res.data, 'TESTING') || _.isEqual(res.data, 'DEV')
            });
        });
    }
})();