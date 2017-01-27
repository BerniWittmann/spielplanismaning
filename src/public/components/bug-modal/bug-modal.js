(function () {
    'use strict';

    angular
        .module('spi.components.bug-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal', 'spi.email', 'spi.config', 'spi.auth'
        ])
        .service('BugDialog', BugDialog)
        .controller('BugMailController', BugMailController);

    function BugDialog($uibModal) {
        return {
            open: open
        };

        function open() {
            //noinspection JSUnusedGlobalSymbols
            return $uibModal
                .open({
                    templateUrl: 'components/bug-modal/bug-modal.html',
                    controller: 'BugMailController',
                    controllerAs: 'vm',
                    resolve: {
                        version: function (config) {
                            return config.getVersion();
                        },
                        env: function (config) {
                            return config.getEnv();
                        },
                        username: function (auth) {
                            return (auth.currentUser() || 'Nicht eingeloggt');
                        },
                        role: function (auth) {
                            if (auth.isLoggedIn()) {
                                return auth.getRole().name;
                            } else {
                                return 'Nicht eingeloggt';
                            }
                        }
                    },
                    size: 'md'
                });
        }
    }

    function BugMailController($uibModalInstance, $timeout, email, version, env, username, role) {
        var vm = this;

        _.extend(vm, {
            sent: false,
            send: send,
            error: undefined,
            abbrechen: abbrechen,
            mail: {
                email: undefined,
                vorname: undefined,
                nachname: undefined,
                title: undefined,
                text: undefined,
                rolle: role,
                env: env,
                version: version,
                username: username,
                datetime: undefined
            }
        });

        function close() {
            $uibModalInstance.close();
        }

        function send(form) {
            if (form.$valid) {
                vm.sent = true;
                vm.mail.name = (vm.mail.vorname || '') + ' ' + (vm.mail.nachname || '');
                vm.mail.datetime = moment().format('DD.MM.YYYY HH:mm');
                email.sendBugReport(vm.mail).then(function () {
                    vm.sent = true;
                    $timeout(close, 5000);
                }, function (err) {
                    vm.error = err.MESSAGE;
                });
            }
        }

        function abbrechen() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();