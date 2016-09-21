(function () {
    'use strict';

    angular
        .module('spi.kontakt.ui', [
            'ui.router', 'spi.config'
        ])
        .config(states)
        .controller('KontaktController', KontaktController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.kontakt', {
                url: '/kontakt'
                , templateUrl: 'templates/kontakt/kontakt.html'
                , controller: KontaktController
                , controllerAs: 'vm'
                , resolve: {
                    versionPromise: function (config) {
                        return config.getVersion();
                    },
                    kontaktPromise: function (config) {
                        return config.getKontakte();
                    },
                    envPromise: function (config) {
                        return config.getEnv();
                    }
                }
            });

    }

    function KontaktController(versionPromise, kontaktPromise, envPromise) {
        var vm = this;

        vm.loading = true;

        _.extend(vm, {
            version: versionPromise.data,
            showBuildStatus: _.isEqual(envPromise.data, 'TESTING') || _.isEqual(envPromise.data, 'DEV'),
            kontakte: kontaktPromise.data
        });
        if (_.isEqual(envPromise.data, 'TESTING')) {
            vm.version += ' TESTUMGEBUNG';
        }
        vm.loading = false;
    }
})();