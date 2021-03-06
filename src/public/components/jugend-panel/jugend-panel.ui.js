(function () {
    'use strict';

    angular
        .module('spi.components.jugendpanel.ui', [
            'spi.auth', 'ui.bootstrap', 'spi.jugend', 'spi.gruppe', 'spi.components.panel.ui', 'spi.components.gruppe-edit-modal.ui', 'spi.spielplan', 'spi.components.bestaetigen-modal.ui', 'spi.components.add-zwischengruppe-modal.ui'
        ])
        .controller('JugendPanelController', JugendPanelController)
        .component('spiJugendPanel', {
            templateUrl: 'components/jugend-panel/jugend-panel.html',
            bindings: {
                jugend: '='
            },
            controller: 'JugendPanelController',
            controllerAs: 'vm'
        });

    function JugendPanelController(auth, gruppe, jugend, GruppeEditierenDialog, spielplan, $state, $scope, BestaetigenDialog, AddZwischengruppeDialog, $rootScope) {
        const vm = this;
        vm.loading = true;

        _.extend(vm, {
            gruppe: {},
            error: undefined,
            gruppen: _.sortBy(vm.jugend.gruppen, 'name'),
            canEdit: canEdit(),
            addGruppe: addGruppe,
            deleteGruppe: deleteGruppe,
            deleteJugend: deleteJugend,
            editGruppe: editGruppe,
            askDeleteJugend: askDeleteJugend,
            askDeleteGruppe: askDeleteGruppe,
            gruppeIsEditable: gruppeIsEditable,
            addZwischengruppe: addZwischengruppe,
            editZwischenGruppenVisible: !$rootScope.spielplanEnabled
        });

        vm.loading = false;

        function canEdit() {
            return auth.isAdmin() && $state.includes('spi.event.verwaltung');
        }

        function gruppeIsEditable(gruppe) {
            return gruppe.type === 'normal' && vm.canEdit;
        }

        function askDeleteGruppe(gruppe) {
            return BestaetigenDialog.open('Gruppe ' + gruppe.name + ' wirklich löschen?', vm.deleteGruppe, gruppe._id);
        }

        function askDeleteJugend(jugend) {
            return BestaetigenDialog.open('Jugend ' + jugend.name + ' wirklich löschen?', vm.deleteJugend, jugend._id);
        }

        function editGruppe(gewaehlteGruppe) {
            GruppeEditierenDialog.open(gewaehlteGruppe);
        }

        function deleteJugend(id) {
            if (!vm.loading) {
                vm.loading = true;
                jugend.delete(id).then(function () {
                    vm.jugend = {};
                    vm.loading = false;
                    $scope.$emit('jugendDeleted');
                    spielplan.createSpielplan();
                });
            }
        }

        function deleteGruppe(id) {
            if (!vm.loading) {
                vm.loading = true;
                vm.error = undefined;
                if (vm.gruppen.length > 1) {
                    gruppe.delete(id).then(function () {
                        spielplan.createSpielplan();
                        vm.gruppen = _.pullAllBy(vm.gruppen, [{'_id': id}], '_id');
                        vm.loading = false;
                    });
                } else {
                    vm.loading = false;
                    vm.showMinZahlGruppen = true;
                }
            }
        }

        function addZwischengruppe() {
            AddZwischengruppeDialog.open(vm.jugend).result.then(function (res) {
                vm.jugend = res;
                vm.gruppen = _.sortBy(vm.jugend.gruppen, 'name');
            });
        }

        function addGruppe(form) {
            if (!vm.loading && form.$valid) {
                vm.loading = true;
                vm.error = undefined;
                form.$setUntouched();
                gruppe.create(vm.jugend._id, vm.gruppe).catch(function (error) {
                    vm.error = error;
                    vm.loading = false;
                }).then(function (res) {
                    spielplan.createSpielplan();
                    vm.gruppen.push(res);
                    vm.gruppe = {};
                    vm.showMinZahlGruppen = false;
                    vm.loading = false;
                });
            }
        }
    }
})();