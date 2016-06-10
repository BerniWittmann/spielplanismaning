(function () {
	'use strict';

	angular
		.module('spi.tgj.gruppe.ui', [
		'spi.auth', 'spi.gruppe', 'ui.router', 'spi.tabelle.ui', 'spi.spieletabelle.ui', 'spi.spiel'
        ])
		.config(states)
		.controller('GruppeController', GruppeController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.gruppe', {
				url: '/gruppen/:gruppeid'
				, templateUrl: 'templates/tgj/gruppen/gruppe/gruppe.html'
				, controller: GruppeController
				, controllerAs: 'vm'
			});

	}

	function GruppeController(gruppe, team, $stateParams, spiel) {
		var vm = this;
		vm.loading = true;

		gruppe.get($stateParams.gruppeid).then(function (response) {
			vm.gruppe = response;
			spiel.getByGruppe(vm.gruppe._id, vm.gruppe.jugend._id).then(function (res) {
				vm.spiele = _.sortBy(res, ['nummer']);
				vm.loading = false;
			})
		});
		
		
	}
})();