(function () {
	'use strict';

	angular
		.module('spi.tgj.ui', [
		'spi.auth', 'spi.tgj.jugenden.ui', 'spi.tgj.gruppen.ui', 'spi.tgj.teams.ui', 'ui.router'
        ])
		.config(states);

	function states($stateProvider) {
		$stateProvider
			.state('spi.tgj', {
				url: ''
				, abstract: true
				, template: '<ui-view></ui-view>'
			});
	}
})();