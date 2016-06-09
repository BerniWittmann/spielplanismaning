(function () {
	'use strict';

	angular
		.module('spi.tgj.gruppen.ui', [
		'spi.auth', 'spi.gruppe', 'spi.tgj.gruppe.ui' , 'ui.router', 'spi.gruppen.gruppenpanel.ui'
        ])
		.config(states)
		.controller('GruppenController', GruppenController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.gruppen', {
				url: '/gruppen'
				, templateUrl: 'templates/tgj/gruppen/gruppen.html'
				, controller: GruppenController
				, controllerAs: 'vm'
			});

	}

	function GruppenController($state, gruppe, NgTableParams) {
		var vm = this;

		_.extend(vm, {
			gruppen: [], 
			gotoGruppe: function (gruppe) {
				$state.go('spi.tgj.gruppe', {gruppeid: gruppe._id});
			}
		});

		gruppe.getAll().then(function (response) {
			vm.gruppen = response.data;
			_.forEach(vm.teams, function (o) {
				o.jugendName = o.jugend.name;
			});
			_.extend(vm, {
				tableParams: new NgTableParams({
					count: 10
				}, {
					counts: [],
					data: vm.gruppen
				})
			});
		});
	}
})();