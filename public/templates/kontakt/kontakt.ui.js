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
                    }
                }
            });

    }

    function KontaktController(versionPromise, kontaktPromise) {
        var vm = this;

        vm.loading = true;
        vm.version = versionPromise.data;
        vm.kontakte = kontaktPromise.data;
        console.log(kontaktPromise);
        vm.loading = false;
    }
})();