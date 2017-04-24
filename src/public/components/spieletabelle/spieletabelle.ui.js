(function () {
    'use strict';

    angular
        .module('spi.components.spieletabelle.ui', ['spi.components.jugendlabel.ui', 'spi.spiel'])
        .controller('SpieleTabellenController', SpieleTabellenController)
        .component('spiSpieleTabelle', {
            templateUrl: 'components/spieletabelle/spieletabelle.html',
            bindings: {
                spiele: '=',
                highlightedTeam: '<'
            },
            controller: 'SpieleTabellenController',
            controllerAs: 'vm'
        });

    function SpieleTabellenController($state, spiel) {
        const vm = this;

        _.extend(vm, {
            gotoTeam: function (team, $event) {
                if (team && team.name) {
                    $event.stopPropagation();
                    $state.go('spi.tgj.team', {
                        teamid: team._id
                    });
                }
            },
            gotoGruppe: function (gruppe, $event) {
                if (gruppe) {
                    $event.stopPropagation();
                    $state.go('spi.tgj.gruppe', {
                        gruppeid: gruppe._id
                    });
                }
            },
            gotoJugend: function (jugend, $event) {
                if (jugend) {
                    $event.stopPropagation();
                    $state.go('spi.tgj.jugend', {
                        jugendid: jugend._id
                    });
                }
            },
            gotoSpiel: function (game) {
                if (game.jugend) {
                    $state.go('spi.spiel', {
                        spielid: game._id
                    });
                }
            },
            gotoPlatz: function (platznummer) {
                $state.go('spi.platz', {
                    platznummer: platznummer + ''
                });
            },
            gotoDate: function (date) {
                $state.go('spi.datum', {
                    datum: moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
                });
            },
            displayGruppe: function (game) {
                return spiel.getGruppeDisplay(game);
            },
            displayTeamA: function(game) {
                return spiel.getTeamDisplay(game, 'A');
            },
            displayTeamB: function(game) {
                return spiel.getTeamDisplay(game, 'B');
            }
        });
    }
})();