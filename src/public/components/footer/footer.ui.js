(function () {
    'use strict';

    angular
        .module('spi.components.footer.ui', ['spi.config'])
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
        };
    }

    function FooterController(config) {
        const vm = this;

        config.getEnv().then(function (res) {
            _.extend(vm, {
                showBuildStatus: _.isEqual(res, 'testing') || _.isEqual(res, 'development')
            });
        });
    }
})();