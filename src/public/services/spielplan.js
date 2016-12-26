angular
    .module('spi.spielplan', ['spi.auth', 'spi.spiel', 'spi.gruppe', 'spi.team'])
    .factory('spielplan', ['$http', '$q', 'auth', 'spiel', 'gruppe', 'team', 'Logger', function ($http, $q, auth, spiel, gruppe, team, Logger) {

        var ENDPOINT_URL = '/api/spielplan';

        var spielplan = {
            startzeit: undefined
            , spielzeit: undefined
            , pausenzeit: undefined
            , spiele: []
            , progress: 0
            , maxProgress: 0
        };

        var lastPlayingTeams;
        var i;
        var spieleGesamt;
        var platz;
        var plaetze = 3;
        var zeit;
        var leereSpieleStreak;
        var maxLeereSpieleStreak = 6;

        var spielplanerstellungRunning = false;

        spielplan.getZeiten = function () {
            return $http.get(ENDPOINT_URL).success(function (data) {
                if (!_.isUndefined(data) && !_.isNull(data)) {
                    spielplan.startzeit = moment(data.startzeit, 'HH:mm');
                    spielplan.spielzeit = data.spielzeit;
                    spielplan.pausenzeit = data.pausenzeit;
                    spielplan.ausnahmen = data.ausnahmen;
                    zeit = spielplan.startzeit;
                } else {
                    spielplan.startzeit = "09:00";
                    spielplan.spielzeit = 8;
                    spielplan.pausenzeit = 2;
                    spielplan.ausnahmen = [];
                }
                return spielplan.data;
            });
        };

        spielplan.saveZeiten = function (zeiten) {
            return $http.put(ENDPOINT_URL + '/zeiten', zeiten, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                return data;
            });
        };

        spielplan.createSpielplan = function () {
            return $http.put(ENDPOINT_URL, {
                headers: {
                    Authorization: 'Bearer ' + auth.getToken()
                }
            }).success(function (data) {
                return data;
            });
        };


        window.onbeforeunload = function () {
            if (spielplanerstellungRunning) {
                return "Achtung! Spielplan wird gerade erstellt! Es verbleiben noch " + Math.round(spielplan.progress / spielplan.maxProgress) + "%. Bitte schließen Sie die Seite noch nicht!";
            }
        };

        return spielplan;
    }]);