(function () {
    'use strict';

    angular
        .module('spi.spieletabelle.ui', [])
        .controller('SpieleTabellenController', SpieleTabellenController)
        .component('spiSpieleTabelle', {
            templateUrl: 'components/spieletabelle/spieletabelle.html'
            , bindings: {
                spiele: '=',
                highlightedTeam: '<'
            }
            , controller: 'SpieleTabellenController'
            , controllerAs: 'vm'
        });

    function SpieleTabellenController($state) {
        var vm = this;

        //noinspection JSUnusedGlobalSymbols
        _.extend(vm, {
            gotoTeam: function (team) {
                $state.go('spi.tgj.team', {
                    teamid: team._id
                });
            }
            , gotoGruppe: function (gruppe) {
                $state.go('spi.tgj.gruppe', {
                    gruppeid: gruppe._id
                });
            }
            , gotoJugend: function (jugend) {
                $state.go('spi.tgj.jugend', {
                    jugendid: jugend._id
                });
            }
            , gotoSpiel: function (spiel) {
                if (spiel.jugend) {
                    $state.go('spi.spiel', {
                        spielid: spiel._id
                    });
                }
            }
            , gotoPlatz: function (platznummer) {
                $state.go('spi.platz', {
                    platznummer: platznummer + ''
                });
            }
        });
    }
})();