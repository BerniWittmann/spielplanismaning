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
                    gotoState('spi.tgj.team', {
                        teamid: team._id
                    }, $event);
                }
            },
            gotoGruppe: function (gruppe, $event) {
                if (gruppe) {
                    gotoState('spi.tgj.gruppe', {
                        gruppeid: gruppe._id
                    }, $event);
                }
            },
            gotoJugend: function (jugend, $event) {
                if (jugend) {
                    gotoState('spi.tgj.jugend', {
                        jugendid: jugend._id
                    }, $event);
                }
            },
            gotoSpiel: function (game) {
                if (game.jugend) {
                    gotoState('spi.spiel', {
                        spielid: game._id
                    }, undefined);
                }
            },
            gotoPlatz: function (platznummer) {
                gotoState('spi.platz', {
                    platznummer: platznummer + ''
                }, undefined);
            },
            gotoDate: function (date) {
                gotoState('spi.datum', {
                    datum: moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD')
                }, undefined);
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

        function gotoState(state, param, $event) {
            if ($event) {
                $event.stopPropagation();
            }
            $state.go(state, param);
        }
    }
})();