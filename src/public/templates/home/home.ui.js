(function () {
    'use strict';

    angular
        .module('spi.templates.home.ui', [
            'ui.router', 'spi.spiel'
        ])
        .config(states)
        .controller('HomeController', HomeController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.home', {
                url: '/home',
                templateUrl: 'templates/home/home.html',
                controller: HomeController,
                controllerAs: 'vm',
                resolve: {
                    spielPromise: function (spiel) {
                        return spiel.getAll();
                    }
                },
                data: {
                    requiredRoles: []
                }
            });

    }

    function HomeController(spielPromise) {
        var vm = this;

        vm.loading = true;
        var allespiele = _.sortBy(spielPromise.data, ['nummer']);
        var spiele = [];
        _.extend(spiele, allespiele);

        var n = _.findIndex(spiele, function (o) {
            return !o.beendet && !_.isNull(o.jugend);
        });

        if (n >= 0) {
            var aktuellesSpielIndex;
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
        vm.loading = false;
    }
})();