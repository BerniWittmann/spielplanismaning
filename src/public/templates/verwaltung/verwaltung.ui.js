(function () {
    'use strict';

    angular
        .module('spi.templates.verwaltung.ui', [
            'spi.templates.verwaltung.allgemein.ui', 'spi.templates.verwaltung.teams.ui', 'spi.templates.verwaltung.spiele-druck.ui', 'spi.templates.verwaltung.email-abonnements.ui', 'spi.templates.verwaltung.ansprechpartner.ui', 'spi.templates.verwaltung.spielplan.ui', 'ui.router'
        ])
        .config(states);

    function states($stateProvider) {
        $stateProvider
            .state('spi.verwaltung', {
                url: '/verwaltung',
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    }
})();