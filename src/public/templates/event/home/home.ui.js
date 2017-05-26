(function () {
    'use strict';

    angular
        .module('spi.templates.home.ui', [
            'ui.router', 'spi.spiel', 'spi.veranstaltungen'
        ])
        .config(states)
        .controller('HomeController', HomeController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.event.home', {
                url: '/home',
                templateUrl: 'templates/event/home/home.html',
                controller: HomeController,
                controllerAs: 'vm',
                resolve: {
                    spiele: function (aktivesEvent, spiel) {
                        return spiel.getAll();
                    }
                },
                data: {
                    requiredRoles: []
                }
            });

    }

    function HomeController(spiele, veranstaltungen) {
        const vm = this;

        vm.loading = true;
        const allespiele = _.sortBy(spiele, ['nummer']);
        spiele = [];
        _.extend(spiele, allespiele);

        let n = _.findIndex(spiele, function (o) {
            return !o.beendet && !_.isNull(o.jugend);
        });

        if (n >= 0) {
            let aktuellesSpielIndex;
            while (n < allespiele.length && _.isUndefined(spiele[n].jugend)) {
                n++;
            }
            if (spiele[n].platz === 3) {
                aktuellesSpielIndex = n - 2;
            } else if (spiele[n].platz === 2) {
                aktuellesSpielIndex = n - 1;
            } else {
                aktuellesSpielIndex = n;
            }

            vm.aktuelleSpiele = _.slice(spiele, aktuellesSpielIndex, aktuellesSpielIndex + 3);
            vm.naechsteSpiele = _.slice(spiele, aktuellesSpielIndex + 3, aktuellesSpielIndex + 6);
        } else {
            vm.aktuelleSpiele = [];
            vm.naechsteSpiele = [];
        }

        vm.eventName = veranstaltungen.getCurrentEvent() ? veranstaltungen.getCurrentEvent().name : 'Überblick';
        vm.loading = false;
    }
})();