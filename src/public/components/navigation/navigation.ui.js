(function () {
    'use strict';

    angular
        .module('spi.components.navigation.ui', [
            'spi.auth', 'ngSanitize'
        ])
        .directive('spiNavigation', spiNavigation)
        .controller('NavigationController', NavigationController);

    function spiNavigation() {
        return {
            restrict: 'E',
            templateUrl: 'components/navigation/navigation.html',
            scope: true,
            controller: NavigationController,
            controllerAs: 'vm'
        };
    }

    function NavigationController($state, $scope, auth) {
        const vm = this;

        _.extend(vm, {
            isLoggedIn: auth.isLoggedIn,
            isAdmin: auth.isAdmin,
            isBearbeiter: auth.isBearbeiter,
            isBearbeiterOrAdmin: function () {
                return auth.isBearbeiter() || auth.isAdmin();
            },
            currentUser: auth.currentUser,
            logOut: auth.logOut,
            isAktiv: function (name) {
                return $state.includes(name);
            }
        });
    }
})();