(function () {
    'use strict';

    angular
        .module('spi.components.navigation.ui', [
            'spi.auth', 'ngSanitize', 'spi.spielplan'
        ])
        .directive('spiNavigation', spiNavigation)
        .controller('NavigationController', NavigationController);

    function spiNavigation() {
        return {
            restrict: 'E'
            , templateUrl: 'components/navigation/navigation.html'
            , scope: true
            , controller: NavigationController
            , controllerAs: 'vm'
        };
    }

    function NavigationController($state, $scope, auth, spielplan) {
        var vm = this;

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
            },
            prog: spielplan.progress,
            progMax: spielplan.maxProgress,
            progDisplay: "",
            message: "<strong>Achtung!</strong> Spielplan wird gerade erstellt.",
            type: 'info'
        });

        $scope.$watch(function () {
            return spielplan.progress;
        }, function () {
            vm.prog = spielplan.progress;
            vm.progMax = spielplan.maxProgress;
            if (vm.prog > 0 && vm.progMax > 0) {
                vm.progDisplay = Math.floor(vm.prog / vm.progMax * 100) + '%';

                if (_.isEqual(vm.prog, vm.progMax)) {
                    vm.message = "Spielplan wurde erfolgreich erstellt.";
                    vm.type = "success";
                    setTimeout(function () {
                        vm.prog = 0;
                        vm.progMax = 0;
                        vm.progDisplay = "";
                        vm.message = "<strong>Achtung!<!strong> Spielplan wird gerade erstellt.";
                        vm.type = "info";
                        $scope.$apply();
                    }, 10000);
                }
            }
        });
    }
})();