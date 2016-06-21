(function () {
	'use strict';

	angular
		.module('spi.spielplan.ausnahme.single.ui', [])
		.controller('SpielplanAusnahmeController', SpielplanAusnahmeController)
		.component('spiSpielplanSingleAusnahme', {
			templateUrl: 'components/spielplan-ausnahmen/spielplan-single-ausnahme/spielplan-single-ausnahme.html'
			, bindings: {
				ausnahme: '='
				, teams: '<'
				, ausnahmen: '='
			}
			, controller: 'SpielplanAusnahmeController'
			, controllerAs: 'vm'
		});

	function SpielplanAusnahmeController($scope, BestaetigenDialog, $timeout) {
		var vm = this;

		_.extend(vm, {
			askDelete: function () {
				return BestaetigenDialog.open('Wirklich diese Ausnahme löschen?', deleteAusnahme);
			}
			, teams2: vm.teams
			, updateTeams2: updateTeams2
		});

		function deleteAusnahme() {
			vm.ausnahmen = _.pull(vm.ausnahmen, vm.ausnahme);
			vm.ausnahme = undefined;
		}

		function updateTeams2() {
			if (_.isUndefined(vm.ausnahme.team1) || _.isNull(vm.ausnahme.team2)) {
				vm.teams2 = vm.teams;
			} else {
				$timeout(function () {
					$scope.$apply(function () {
						vm.teams2 = getTeams2();
					});
				}, 0, false);
			}
		}

		function getTeams2() {
			if (_.isUndefined(vm.ausnahme.team1) || _.isNull(vm.ausnahme.team2)) {
				return vm.teams;
			}
			return _.filter(vm.teams, function (o) {
				return !_.isEqual(o.jugend._id, vm.ausnahme.team1.jugend._id);
			});
		}
	}
})();