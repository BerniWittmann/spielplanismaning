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
                    reason: undefined
                }
            });

    }

    function LoginController(auth, $state, lockdown, $stateParams) {
        var vm = this;
        vm.lockdown = lockdown.data;
        vm.user = {};
        vm.reason = $stateParams.reason;
        vm.login = function () {
            vm.user.username = vm.user.username.toLowerCase();
            auth.logIn(vm.user).then(function () {
                $state.go('spi.home');
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