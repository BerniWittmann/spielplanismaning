(function () {
    'use strict';

    angular
        .module('spi.templates.shared.ui', [
            'ui.router', 'spi.templates.veranstaltungen.ui', 'spi.templates.kontakt.ui', 'spi.templates.login.ui',  'spi.templates.shared.verwaltung.ui', 'spi.templates.password-forgot.ui', 'spi.templates.password-reset.ui', 'spi.templates.account.ui'
        ])
        .config(states);

    function states($stateProvider) {
        $stateProvider
            .state('spi.shared', {
                url: '',
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    }
})();