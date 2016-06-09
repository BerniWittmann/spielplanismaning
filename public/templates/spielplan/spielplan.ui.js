(function () {
	'use strict';

	angular
		.module('spi.spielplan.ui', [
            'ui.router', 'spi.spiel'
        ])
		.config(states)
		.controller('SpielplanController', SpielplanController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.spielplan', {
				url: '/spielplan'
				, templateUrl: 'templates/spielplan/spielplan.html'
				, controller: SpielplanController
				, controllerAs: 'vm'
			});

	}

	function SpielplanController($state, spiel) {
		var vm = this;
		vm.spiele = [];

		_.extend(vm, {
			gotoSpiel: function (gewaehltesspiel) {
				if (gewaehltesspiel.jugend) {
					$state.go('spi.spiel', {
						spielid: gewaehltesspiel._id
					});
				}
			}
		})

		spiel.getAll().then(function (res) {
			vm.spiele = _.sortBy(res.data, ['nummer']);
		});
	}
})();