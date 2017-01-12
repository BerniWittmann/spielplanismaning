(function () {
    'use strict';

    angular
        .module('spi.templates.login.ui', [
            'spi.auth', 'ui.router', 'spi.config'
        ])
        .config(states)
        .controller('LoginController', LoginController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.login', {
                url: '/login',
                templateUrl: 'templates/login/login.html',
                controller: LoginController,
                controllerAs: 'vm',
                resolve: {
                    lockdown: function (config) {
                        return config.getLockdown();
                    }
                },
                params: {
                    reason: undefined,
                    reasonKey: undefined,
                    next: undefined
                },
                data: {
                    requiredRoles: []
                }
            });

    }

    function LoginController(auth, $state, lockdown, $stateParams, toastr) {
        var vm = this;
        vm.lockdown = lockdown.data;
        vm.user = {};
        vm.reason = $stateParams.reason;

        if (_.isEqual($stateParams.reasonKey, 'AUTH_ERROR')) {
            toastr.error('Sie haben keinen Zugriff auf diese Ressource', 'Fehler');
        }
        vm.login = function () {
            vm.user.username = vm.user.username.toLowerCase();
            auth.logIn(vm.user).then(function () {
                if ($stateParams.next) {
                    $state.go($stateParams.next);
                } else {
                    $state.go('spi.home');
                }
            }, function (error) {
                console.log(error);
                vm.error = error.data;
            });
        };
        vm.resetErr = function () {
            vm.error = undefined;
        };
    }
})();