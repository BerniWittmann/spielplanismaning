(function () {
	'use strict';

	angular
		.module('spi.spielplan.ausnahmen.ui', ['spi.spielplan.ausnahme.single.ui'])
		.controller('SpielplanAusnahmenController', SpielplanAusnahmenController)
		.component('spiSpielplanAusnahmen', {
			templateUrl: 'components/spielplan-ausnahmen/spielplan-ausnahmen.html'
			, bindings: {
				teams: '<'
			}
			, controller: 'SpielplanAusnahmenController'
			, controllerAs: 'vm'
		});

	function SpielplanAusnahmenController($scope) {
		var vm = this;
		var singleAusnahme = {
			team1: undefined
			, team2: undefined
		}

		_.extend(vm, {
			ausnahmen: []
			, addEmptyAusnahme: addEmptyAusnahme
		});

		function addEmptyAusnahme() {
			var o = {};
			_.extend(o, singleAusnahme);
			vm.ausnahmen.push(o);
		}
	}
})();