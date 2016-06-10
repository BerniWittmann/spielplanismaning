(function () {
	'use strict';

	angular
		.module('spi.tgj.team.ui', [
		'spi.auth', 'spi.team', 'ui.router', 'spi.spiel'
        ])
		.config(states)
		.controller('TeamController', TeamController);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj.team', {
				url: '/teams/:teamid'
				, templateUrl: 'templates/tgj/teams/team/team.html'
				, controller: TeamController
				, controllerAs: 'vm'
			});

	}

	function TeamController(team, $stateParams, spiel) {
		var vm = this;

		team.get($stateParams.teamid).then(function (response) {
			vm.team = response;
			team.getByGruppe(vm.team.gruppe._id, vm.team.jugend._id).then(function (res) {
				vm.teams = res;
			});

		});

		spiel.getByTeam($stateParams.teamid).then(function (response) {
			vm.spiele = _.sortBy(response, ['nummer']);
		});
	}
})();