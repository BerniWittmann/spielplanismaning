(function () {
    'use strict';

    angular
        .module('spi.templates.shared.verwaltung.ui', [
            'ui.router', 'spi.templates.verwaltung.veranstaltungen.ui', 'spi.templates.verwaltung.ansprechpartner.ui', 'spi.templates.verwaltung.allgemein.ui'
        ])
        .config(states);

    function states($stateProvider) {
        $stateProvider
            .state('spi.shared.verwaltung', {
                url: '/verwaltung',
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    }
})();