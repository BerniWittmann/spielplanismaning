(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.event.ui', [
            'spi.templates.verwaltung.teams.ui', 'spi.templates.verwaltung.spiele-druck.ui', 'spi.templates.verwaltung.email-abonnements.ui', 'spi.templates.verwaltung.spielplan.ui', 'spi.templates.verwaltung.slugs.ui', 'ui.router'
        ])
        .config(states);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.verwaltung', {
                url: '/verwaltung',
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    }
})();