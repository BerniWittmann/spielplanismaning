(function () {
    'use strict';

    angular
        .module('spi.navigation.ui', [
            'spi.auth', 'ngSanitize'
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

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            isLoggedIn: auth.isLoggedIn
            , canAccess: function (i) {
                return auth.canAccess(i)
            }
            , currentUser: auth.currentUser
            , logOut: auth.logOut
            , isAktiv: function (name) {
                return $state.includes(name);
            }
        });

        vm.prog = spielplan.progress;
        vm.progMax = spielplan.maxProgress;
        vm.progDisplay = "";
        vm.message = "<strong>Achtung!</strong> Spielplan wird gerade erstellt.";
        vm.type = "info";

        $scope.$watch(function () {
            return spielplan.progress;
        }, function () {
            vm.prog = spielplan.progress;
            vm.progMax = spielplan.maxProgress;
            if (vm.prog > 0 && vm.progMax > 0) {
                vm.progDisplay = Math.floor(vm.prog / vm.progMax * 100) + '%';
                console.log(vm.progDisplay);

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