(function () {
    'use strict';

    angular
        .module('spi.components.veranstaltung-edit-modal.ui', [
            'spi.team', 'ui.bootstrap', 'ui.bootstrap.modal', 'spi.veranstaltungen', 'spi.config'
        ])
        .service('VeranstaltungEditierenDialog', VeranstaltungEditierenDialog)
        .controller('VeranstaltungEditierenController', VeranstaltungEditierenController);

    function VeranstaltungEditierenDialog($uibModal) {
        return {
            open: open
        };

        function open(gewaehltesEvent) {
            return $uibModal
                .open({
                    templateUrl: 'components/veranstaltung-edit-modal/veranstaltung-edit-modal.html',
                    controller: 'VeranstaltungEditierenController',
                    controllerAs: 'vm',
                    resolve: {
                        event: function () {
                            return gewaehltesEvent;
                        }
                    },
                    size: 'md'
                });
        }
    }

    function VeranstaltungEditierenController($uibModalInstance, veranstaltungen, event, config) {
        const vm = this;

        event.printMannschaftslisten = event.printMannschaftslisten ? event.printMannschaftslisten.toString() : 'false';
        event.spielplanEnabled = event.spielplanEnabled ? event.spielplanEnabled.toString() : 'false';
        _.extend(vm, {
            veranstaltung: event,
            name: event.name,
            save: save,
            abbrechen: function () {
                $uibModalInstance.dismiss('cancel');
            }
        });

        function save(form) {
            if (form.$valid) {
                vm.loading = true;
                form.$setUntouched();
                veranstaltungen.update(vm.veranstaltung._id, vm.veranstaltung).then(function (res) {
                    vm.loading = false;
                    config.getConfig();
                    $uibModalInstance.close(res);
                });
            }
        }
    }
})();