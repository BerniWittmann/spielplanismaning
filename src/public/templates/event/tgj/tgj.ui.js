(function () {
    'use strict';

    angular
        .module('spi.templates.tgj.ui', [
            'spi.templates.tgj.jugenden.ui', 'spi.templates.tgj.gruppen.ui', 'spi.templates.tgj.teams.ui', 'ui.router'
        ])
        .config(states);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.tgj', {
                url: '',
                abstract: true,
                template: '<ui-view></ui-view>'
            });
    }
})();