(function () {
    'use strict';

    angular
        .module('spi.templates.password-reset.ui', [
            'spi.auth', 'ui.router'
        ])
        .config(states)
        .controller('PasswordResetController', PasswordResetController)
        .directive('compareTo', compareTo);

    function states($stateProvider) {
        $stateProvider
            .state('spi.password-reset', {
                url: '/reset-password?token',
                templateUrl: 'templates/password-reset/password-reset.html',
                controller: PasswordResetController,
                controllerAs: 'vm',
                resolve: {
                    isValidToken: isValidToken
                },
                data: {
                    requiredRoles: []
                }
            });

    }

    function compareTo() {
        return {
            require: "ngModel",
            scope: {
                otherModelValue: "=compareTo"
            },
            link: function(scope, element, attributes, ngModel) {

                ngModel.$validators.compareTo = function(modelValue) {
                    return modelValue === scope.otherModelValue;
                };

                scope.$watch("otherModelValue", function() {
                    ngModel.$validate();
                });
            }
        };
    }

    function isValidToken($stateParams, $q, $state, toastr, $timeout, auth) {
        if($stateParams.token) {
            return auth.checkResetToken($stateParams.token).catch(function (err) {
                console.log(err);
                return handleInvalidToken($timeout, $state, toastr, $q);
            }).then(function () {
                $q.when();
                return true;
            });
        }
        return handleInvalidToken($timeout, $state, toastr, $q);
    }

    function handleInvalidToken($timeout, $state, toastr, $q) {
        $timeout(function () {
            $state.go('spi.home');
            toastr.warning('Der Token zum Zurücksetzen des Passworts war falsch.', 'Ungüliger Token');
        });

        $q.reject();
        return false;
    }

    function PasswordResetController(auth, toastr, $stateParams, $state, isValidToken) {
        var vm = this;
        vm.password = undefined;
        vm.passwordCheck = undefined;
        vm.username = undefined;
        vm.resetPassword = function () {
            if(vm.password && isValidToken && vm.username && _.isEqual(vm.password, vm.passwordCheck)) {
                auth.resetPassword(vm.username, $stateParams.token, vm.password).then(function () {
                    toastr.success('Dein Passwort wurde zurückgesetzt, du kannst dich jetzt abmelden.', 'Passwort zurückgesetzt');
                    $state.go('spi.login');
                }, function (error) {
                    console.log(error);
                    toastr.error(error.MESSAGE, 'Fehler');
                });
            }else if (!_.isEqual(vm.password, vm.passwordCheck)) {
                toastr.error('Die Passwörter müssen übereinstimmen.', 'Unterschiedliche Passwörter');
                vm.password = undefined;
                vm.passwordCheck = undefined;
            }
        };
    }
})();