(function () {
    'use strict';

    angular
        .module('spi.components.bestaetigen-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal'
        ])
        .service('BestaetigenDialog', BestaetigenDialog)
        .controller('BestaetigenController', BestaetigenController);

    function BestaetigenDialog($uibModal) {
        return {
            open: open
        };

        function open(message, fction, parameters) {
            //noinspection JSUnusedGlobalSymbols
            return $uibModal
                .open({
                    templateUrl: 'components/bestaetigen-modal/bestaetigen-modal.html',
                    controller: 'BestaetigenController',
                    controllerAs: 'vm',
                    resolve: {
                        fction: function () {
                            return fction;
                        },
                        message: function () {
                            return message;
                        },
                        parameters: function () {
                            return (parameters || undefined);
                        }
                    },
                    size: 'sm'
                });
        }
    }

    function BestaetigenController($uibModalInstance, message, fction, parameters) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            message: message,
            save: save,
            abbrechen: abbrechen
        });
        vm.loading = false;

        function save() {
            $uibModalInstance.close();
            return fction(parameters);
        }

        function abbrechen() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();