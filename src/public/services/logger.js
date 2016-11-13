(function () {
    'use strict';

    angular
        .module('spi.logger', [])
        .service('Logger', Logger)
        .constant('PREFIX', 'Spielplan-Ismaning Log: ')
        .constant('MAX_STRING_LENGTH', 70);

    function Logger(PREFIX
        , MAX_STRING_LENGTH) {
        var LOGGING_ENABLED = false;

        return {
            log: function (text) {
                return log(text)
            }
            , enableLogging: enableLogging
            , disableLogging: disableLogging
        };

        function log(text) {
            if (LOGGING_ENABLED) {
                if (_.isObject(text)) {
                    text = JSON.stringify(text);
                }
                if (text.length > MAX_STRING_LENGTH) {
                    text = text.substring(0, MAX_STRING_LENGTH) + "...";
                }
                console.log(PREFIX + text);
            }
        }

        function enableLogging() {
            LOGGING_ENABLED = true;
        }

        function disableLogging() {
            LOGGING_ENABLED = false;
        }
    }
})();