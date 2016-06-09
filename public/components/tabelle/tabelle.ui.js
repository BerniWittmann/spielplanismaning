(function () {
	'use strict';

	angular
		.module('spi.tabelle.ui', ['spi.gruppe'])
		.controller('TabelleController', TabelleController)
		.component('spiTabelle', {
			templateUrl: 'components/tabelle/tabelle.html'
			, bindings: {
				teams: '<',
				highlightedTeam: '<'
			}
			, controller: 'TabelleController'
			, controllerAs: 'vm'
		});

	function TabelleController($state, gruppe) {
		var vm = this;

		vm.$onChanges = function (changeObj) {
			if (!_.isUndefined(changeObj.teams) && !_.isUndefined(changeObj.teams.currentValue)) {
				vm.teams = changeObj.teams.currentValue.sort(compare);
			}
		};
		
		_.extend(vm, {
			gotoTeam: function (team) {
				$state.go('spi.tgj.team', {
					teamid: team._id
				});
			}
		})

		function compare(a, b) {
			var result = a.punkte - b.punkte;
			if (result === 0) {
				result = (a.tore - a.gtore) - (b.tore - b.gtore);
				if (result === 0) {
					result = a.tore - b.tore;
				}
			}
			return result * -1;
		}
	}
})();