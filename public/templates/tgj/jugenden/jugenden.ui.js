(function () {
	'use strict';

	angular
		.module('spi.tgj.jugenden.ui', [
		'spi.auth', 'spi.jugend', 'ui.router', 'spi.verwaltung.teams.jugendpanel.ui', 'spi.tgj.jugend.ui'
        ])
		.config(states)
		.controller('JugendenController', JugendenController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.jugenden', {
				url: '/jugenden'
				, templateUrl: 'templates/tgj/jugenden/jugenden.html'
				, controller: 'JugendenController'
				, controllerAs: 'vm'
			});

	}

	function JugendenController($state, jugend) {
		var vm = this;
		vm.loading = true;

		_.extend(vm, {
			jugenden: []
		});

		jugend.getAll().then(function (response) {
			vm.jugenden = response.data;
			vm.loading = false;
		});
	}
})();