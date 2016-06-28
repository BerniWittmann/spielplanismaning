(function () {
    'use strict';

    angular
        .module('spi.verwaltung.teams.jugendpanel.ui', [
            'spi.auth', 'ui.bootstrap', 'spi.jugend', 'spi.gruppe', 'spi.panel.ui', 'spi.verwaltung.gruppe-edit-modal.ui', 'spi.spielplan', 'ui.router'
        ])
        .controller('JugendPanelController', JugendPanelController)
        .component('spiJugendPanel', {
            templateUrl: 'components/jugend-panel/jugend-panel.html'
            , bindings: {
                jugend: '='
            }
            , controller: 'JugendPanelController'
            , controllerAs: 'vm'
        });

    function JugendPanelController(auth, gruppe, jugend, GruppeEditierenDialog, spielplan, $state, BestaetigenDialog) {
        var vm = this;
        vm.loading = true;
        vm.error = undefined;

        //noinspection JSUnusedGlobalSymbols,JSUnusedGlobalSymbols
        _.extend(vm, {
            gruppe: {}
            , addGruppe: function () {
                if (!vm.loading) {
                    vm.loading = true;
                    vm.error = undefined;
                    gruppe.create(vm.jugend._id, vm.gruppe).error(function (error) {
                        vm.error = error;
                        vm.loading = false;
                    }).then(function () {
                        spielplan.createSpielplan();
                        getGruppen();
                        vm.gruppe = {};
                        vm.showMinZahlGruppen = false;
                        vm.loading = false;
                    });
                }
            }
            , deleteGruppe: function (id) {
                if (!vm.loading) {
                    vm.loading = true;
                    vm.error = undefined;
                    if (vm.gruppen.length > 1) {
                        gruppe.delete(id).then(function () {
                            spielplan.createSpielplan();
                            getGruppen();
                            vm.loading = false;
                        });
                    } else {
                        vm.loading = false;
                        vm.showMinZahlGruppen = true;
                    }
                }
            }
            , deleteJugend: function (id) {
                if (!vm.loading) {
                    vm.loading = true;
                    jugend.delete(id).then(function () {
                        vm.loading = false;
                        spielplan.createSpielplan();
                    });
                    vm.jugend = {};
                }
            }
            , editGruppe: function (gewaehlteGruppe) {
                GruppeEditierenDialog.open(gewaehlteGruppe);
            }
            , canEdit: canEdit()
            , askDeleteJugend: function (jugend) {
                return BestaetigenDialog.open('Jugend ' + jugend.name + ' wirklich löschen?', vm.deleteJugend, jugend._id)
            }
            , askDeleteGruppe: function (gruppe) {
                return BestaetigenDialog.open('Gruppe ' + gruppe.name + ' wirklich löschen?', vm.deleteGruppe, gruppe._id)
            }
        });

        getGruppen();

        function getGruppen() {
            gruppe.getByJugend(vm.jugend._id).then(function (res) {
                vm.gruppen = _.sortBy(res, 'name');
                vm.loading = false;
            })
        }

        function canEdit() {
            return auth.canAccess(1) && $state.includes('spi.verwaltung');
        }
    }

})();