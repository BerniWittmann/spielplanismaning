(function () {
    'use strict';

    angular
        .module('spi.bestaetigen-modal.ui', [
            'ui.bootstrap', 'ui.bootstrap.modal'
            ,])
        .service('BestaetigenDialog', BestaetigenDialog)
        .controller('BestaetigenController', BestaetigenController);

    function BestaetigenDialog($uibModal) {
        return {
            open: open
        };

        function open(message, fction, parameters) {
            return $uibModal
                .open({
                    templateUrl: 'components/bestaetigen-modal/bestaetigen-modal.html'
                    , controller: 'BestaetigenController'
                    , controllerAs: 'vm'
                    , resolve: {
                        fction: function () {
                            return fction;
                        }
                        , message: function () {
                            return message;
                        }
                        , parameters: function () {
                            return (parameters || undefined);
                        }
                    }
                    , size: 'sm'
                });
        }
    }

    function BestaetigenController($uibModalInstance
        , message
        , fction
        , parameters) {
        var vm = this;
        vm.loading = true;

        _.extend(vm, {
            message: message
            , save: save
            , abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            }
        });
        vm.loading = false;

        function save() {
            $uibModalInstance.close();
            return fction(parameters);
        }
    }
})();