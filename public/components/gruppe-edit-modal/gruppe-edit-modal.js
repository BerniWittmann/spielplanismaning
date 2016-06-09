(function () {
	'use strict';

	angular
		.module('spi.verwaltung.gruppe-edit-modal.ui', [
      		'spi.team', 'spi.gruppe', 'ui.bootstrap', 'ui.bootstrap.modal', 'spi.spielplan'
        ])
		.service('GruppeEditierenDialog', GruppeEditierenDialog)
		.controller('GruppeEditierenController', GruppeEditierenController);

	function GruppeEditierenDialog(
		$uibModal
	) {
		return {
			open: open
		};

		function open(gewaehlteGruppe) {
			return $uibModal
				.open({
					templateUrl: 'components/gruppe-edit-modal/gruppe-edit-modal.html'
					, controller: 'GruppeEditierenController'
					, controllerAs: 'vm'
					, resolve: {
						gewGruppe: function () {
							return gewaehlteGruppe;
						}
					}
				, });
		}
	}

	function GruppeEditierenController(
		$state
		, $uibModalInstance
		, team
		, gruppe
		, gewGruppe
		, spielplan
	) {
		var vm = this;

		_.extend(vm, {
			gruppe: gewGruppe
			, save: save
			, abbrechen: function () {
				$uibModalInstance.dismiss('cancel');
			}
			, team: {}
			, addTeam: function () {
				_.extend(vm.team, {
					gruppe: vm.gruppe._id
					, jugend: vm.gruppe.jugend._id
				})
				team.create(vm.team).then(function (res) {
					spielplan.createSpielplan();
					getTeamsByGruppe();
					vm.team = {};
				});
			}
			, gotoTeam: function (teamid) {
				$state.go('spi.tgj.team', {
					teamid: teamid
				});
				$uibModalInstance.dismiss('cancel');
			}
			, deleteTeam: function (teamid) {
				team.delete(teamid).then(function (res) {
					spielplan.createSpielplan();
					getTeamsByGruppe();
				});
			}
		});
		getTeamsByGruppe();

		function getTeamsByGruppe() {
			team.getByGruppe(vm.gruppe._id, vm.gruppe.jugend._id).then(function (res) {
				vm.teams = res;
			})
		}

		function save() {
			$uibModalInstance.close();
		}
	}
})();