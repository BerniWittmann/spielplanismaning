(function () {
    'use strict';

    angular
        .module('spi.templates.event.ui', [
            'ui.router', 'spi.veranstaltungen', 'spi.templates.home.ui', 'spi.templates.platz.ui', 'spi.templates.spiel.ui', 'spi.templates.spielplan.ui', 'spi.templates.tabellen.ui', 'spi.templates.teamdeabonnieren.ui', 'spi.templates.tgj.ui', 'spi.templates.verwaltung.event.ui', 'spi.templates.datum.ui'
        ])
        .config(states)
        .controller('TemplateEventController', TemplateEventController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event', {
                url: '/:eventid',
                abstract: true,
                template: '<ui-view></ui-view>',
                controller: TemplateEventController,
                controllerAs: 'vm',
                reloadOnSearch: false,
                resolve: {
                    aktivesEvent: function (veranstaltungen, $stateParams, $state, $timeout) {
                        const eventID = $stateParams.eventid || veranstaltungen.getCurrentEvent().slug;
                        return veranstaltungen.getBySlugOrID(eventID).then(function (res) {
                            veranstaltungen.setCurrentEvent(res);
                            return res;
                        }).catch(function () {
                            return $timeout(function () {
                                return $state.go('spi.shared.veranstaltungen');
                            });
                        });
                    }
                }
            });
    }

    function TemplateEventController(aktivesEvent, veranstaltungen, $state) {
        if (aktivesEvent) {
            veranstaltungen.setCurrentEvent(aktivesEvent);
        } else {
            $state.go('spi.shared.veranstaltungen');
        }
    }
})();