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

	function JugendPanelController(auth, gruppe, jugend, GruppeEditierenDialog, spielplan, $state) {
		var vm = this;
		vm.loading = true;
		vm.error = undefined;

		_.extend(vm, {
			gruppe: {}
			, addGruppe: function () {
				vm.loading = true;
				vm.error = undefined;
				gruppe.create(vm.jugend._id, vm.gruppe).error(function (error) {
					vm.error = error;
					vm.loading = false;
				}).then(function (res) {
					spielplan.createSpielplan();
					getGruppen();
					vm.gruppe = {};
					vm.showMinZahlGruppen = false;
					vm.loading = false;
				});
			}
			, deleteGruppe: function (id) {
				vm.loading = true;
				vm.error = undefined;
				if (vm.gruppen.length > 1) {
					gruppe.delete(id).then(function (res) {
						spielplan.createSpielplan();
						getGruppen();
						vm.loading = false;
					});
				} else {
					vm.loading = false;
					vm.showMinZahlGruppen = true;
				}
			}
			, deleteJugend: function (id) {
				vm.loading = true;
				jugend.delete(id).then(function (res) {
					vm.loading = false;
					spielplan.createSpielplan();
				});
				vm.jugend = {};
			}
			, editGruppe: function (gewaehlteGruppe) {
				GruppeEditierenDialog.open(gewaehlteGruppe);
			}
			, canEdit: canEdit()
		})

		getGruppen();

		function getGruppen() {
			gruppe.getByJugend(vm.jugend._id).then(function (res) {
				vm.gruppen = res;
				vm.loading = false;
			})
		}

		function canEdit() {
			return auth.isLoggedIn() && $state.includes('spi.verwaltung');
		}
	}

})();