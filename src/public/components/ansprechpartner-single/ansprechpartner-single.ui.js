(function () {
    'use strict';

    angular
        .module('spi.components.ansprechpartner-single.ui', ['spi.ansprechpartner', 'toastr'])
        .controller('AnsprechpartnerSingleController', AnsprechpartnerSingleController)
        .directive('spiAnsprechpartnerSingle', function () {
            return {
                templateUrl: 'components/ansprechpartner-single/ansprechpartner-single.html',
                restrict: 'A',
                controller: 'AnsprechpartnerSingleController',
                controllerAs: 'vm',
                scope: {
                    'spiAnsprechpartnerSingle': '='
                }
            };
        });

    function AnsprechpartnerSingleController($scope, ansprechpartner, toastr) {
        const vm = this;

        _.extend(vm, {
            kontakt: $scope.spiAnsprechpartnerSingle,
            isEditing: false,
            edit: edit,
            save: save,
            isNew: false,
            deleteKontakt: deleteKontakt
        });

        if (!vm.kontakt._id) {
            vm.isNew = true;
            vm.isEditing = true;
        }

        function edit() {
            vm.isEditing = true;
        }

        function deleteKontakt() {
            if (vm.isEditing && !vm.isNew) {
                ansprechpartner.delete(vm.kontakt._id).then(function () {
                    vm.isEditing = false;
                    $scope.$emit('ansprechpartnerDeleted');
                });
            }
        }

        function save() {
            if (!vm.kontakt.email || !vm.kontakt.name || !vm.kontakt.turnier) {
                toastr.error('Bitte alle Felder ausfüllen.', 'Achtung');
                return;
            }

            if (vm.isEditing && !vm.isNew) {
                ansprechpartner.update(vm.kontakt._id, vm.kontakt).then(function (res) {
                    vm.kontakt = res;
                    vm.isEditing = false;
                });
            } else if (vm.isEditing && vm.isNew) {
                ansprechpartner.create(vm.kontakt).then(function (res) {
                    vm.kontakt = res;
                    vm.isNew = false;
                    vm.isEditing = false;
                });
            }
        }
    }
})();