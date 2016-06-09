(function () {
	'use strict';

	angular
		.module('spi.gruppen.gruppenpanel.ui', [
            'spi.auth', 'ui.bootstrap', 'spi.panel.ui', 'spi.gruppe'
        ])
		.controller('GruppenPanelController', GruppenPanelController)
		.component('spiGruppenPanel', {
			templateUrl: 'components/gruppen-panel/gruppen-panel.html'
			, bindings: {
				gruppe: '='
			}
			, controller: 'GruppenPanelController'
			, controllerAs: 'vm'
		});

	function GruppenPanelController(auth, gruppe) {
		var vm = this;

		_.extend(vm, {
			teams: []
			, isLoggedIn: auth.isLoggedIn()
		});
		
		getGruppe();

		function getGruppe() {
			gruppe.get(vm.gruppe._id).then(function (res) {
				vm.gruppe = res;
				vm.teams = res.teams;
			})
		}
	}

})();