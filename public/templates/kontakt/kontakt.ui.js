(function () {
    'use strict';

    angular
        .module('spi.kontakt.ui', [
            'ui.router'
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
                    versionPromise: function ($http) {
                        return $http.get('/api/config/version');
                    },
                    kontaktPromise: function ($http) {
                        return $http.get('/api/config/kontakt');
                    },
                    envPromise: function ($http) {
                        return $http.get('/api/config/env');
                    }
                }
            });

    }

    function KontaktController(versionPromise, kontaktPromise, envPromise) {
        var vm = this;

        vm.loading = true;
        vm.version = versionPromise.data;
        if (_.isEqual(envPromise.data, 'TESTING')) {
            vm.version += ' TESTUMGEBUNG';
        }
        vm.showBuildStatus = _.isEqual(envPromise.data, 'TESTING') || _.isEqual(envPromise.data, 'DEV');
        vm.kontakte = kontaktPromise.data;
        vm.loading = false;
    }
})();