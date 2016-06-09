(function () {
	'use strict';

	angular
		.module('spi', [
            'spi.auth', 'spi.logger', 'spi.home.ui', 'spi.login.ui', 'spi.tgj.ui', 'spi.navigation.ui', 'spi.team', 'spi.verwaltung.ui', 'ui.router', 'spi.tabellen.ui', 'spi.login.ui', 'spi.spielplan.ui', 'spi.jugenden.jugendlabel.ui', 'spi.spielstand.singlespiel.ui', 'spi.spiel.ui', 'spi.tabelle.ui', 'spi.footer.ui'
        ])
		.config(states);

	function states($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise('/home');

		$stateProvider
			.state('spi', {
				url: ''
				, template: '<ui-view></ui-view>'
				, abstract: true
			});
	}
})();