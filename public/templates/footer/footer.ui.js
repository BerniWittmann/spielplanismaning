(function () {
    'use strict';

    angular
        .module('spi.footer.ui', [])
        .directive('spiFooter', spiFooter)
        .controller('FooterController', FooterController);

    function spiFooter() {
        return {
            restrict: 'E'
            , templateUrl: 'templates/footer/footer.html'
            , scope: true
            , controller: FooterController
            , controllerAs: 'vm'
        };
    }

    function FooterController($http) {
        var vm = this;
        vm.isTesting = false;

        $http.get('/api/config/version').then(function (res) {
            vm.version = res.data;
            $http.get('/api/config/env').then(function (response) {
                if (_.isEqual(response.data, 'TESTING')) {
                    vm.version += ' TESTUMGEBUNG';
                }
                vm.showBuildStatus = _.isEqual(response.data, 'TESTING') || _.isEqual(response.data, 'DEV');
            });
        });

    }

})();