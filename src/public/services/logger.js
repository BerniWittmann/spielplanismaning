(function () {
    'use strict';

    angular
        .module('spi.logger', [])
        .service('Logger', Logger);

    function Logger(LOG_PREFIX, LOG_MAX_STRING_LENGTH) {
        var LOGGING_ENABLED = false;

        return {
            log: function (text) {
                return log(text);
            },
            enableLogging: enableLogging,
            disableLogging: disableLogging
        };

        function log(text) {
            if (LOGGING_ENABLED) {
                if (_.isObject(text)) {
                    text = JSON.stringify(text);
                }
                if (text.length > LOG_MAX_STRING_LENGTH) {
                    text = text.substring(0, LOG_MAX_STRING_LENGTH) + "...";
                }
                console.log(LOG_PREFIX + text);
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