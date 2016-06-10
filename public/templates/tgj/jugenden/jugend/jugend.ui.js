(function () {
	'use strict';

	angular
		.module('spi.tgj.jugend.ui', [
		'spi.auth', 'spi.jugend', 'ui.router', 'spi.gruppen.gruppenpanel.ui', 'spi.spiel'
        ])
		.config(states)
		.controller('JugendController', JugendController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.jugend', {
				url: '/jugenden/:jugendid'
				, templateUrl: 'templates/tgj/jugenden/jugend/jugend.html'
				, controller: JugendController
				, controllerAs: 'vm'
			});

	}

	function JugendController(jugend, $stateParams, spiel) {
		var vm = this;

		jugend.get($stateParams.jugendid).then(function (response) {
			vm.jugend = response;
		});

		spiel.getByJugend($stateParams.jugendid).then(function (response) {
			vm.spiele = _.sortBy(response, ['nummer']);
		});
	}
})();