(function () {
	'use strict';

	angular
		.module('spi', [
            'spi.auth', 'spi.logger', 'spi.home.ui', 'spi.login.ui', 'spi.tgj.ui', 'spi.navigation.ui', 'spi.team', 'spi.verwaltung.ui', 'ui.router', 'spi.tabellen.ui', 'spi.login.ui', 'spi.spielplan.ui', 'spi.jugenden.jugendlabel.ui', 'spi.spiel.ui', 'spi.tabelle.ui', 'spi.footer.ui', 'spi.loader.ui'
        ])
		.config(states)
		.run(run);

	function states($urlRouterProvider, $stateProvider) {
		$urlRouterProvider.otherwise('/home');

		$stateProvider
			.state('spi', {
				url: ''
				, template: '<ui-view></ui-view>'
				, abstract: true
			});
	}

	function run($state, $rootScope) {
		$rootScope.$on('$stateChangeStart', function () {
			$rootScope.loading = true;
		});


		$rootScope.$on('$stateChangeSuccess', function () {
			$rootScope.loading = false;
		});
	}
})();