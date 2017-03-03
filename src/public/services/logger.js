(function () {
    'use strict';

    angular
        .module('spi.logger', [])
        .service('Logger', Logger);

    function Logger(LOG_PREFIX, LOG_MAX_STRING_LENGTH) {
        let LOGGING_ENABLED = false;

        return {
            log: function (text) {
                return log(text, 'log');
            },
            warn: function (text) {
                return log(text, 'warn');
            },
            error: function (text) {
                return log(text, 'error');
            },
            info: function (text) {
                return log(text, 'info');
            },
            enableLogging: enableLogging,
            disableLogging: disableLogging
        };

        function log(text, method) {
            if (LOGGING_ENABLED) {
                if (_.isObject(text)) {
                    text = JSON.stringify(text);
                }
                if (text.length > LOG_MAX_STRING_LENGTH) {
                    text = text.substring(0, LOG_MAX_STRING_LENGTH) + "...";
                }
                const methodName = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
                const message = LOG_PREFIX + ' ' + methodName + ': ' + text;
                if (method === 'error') {
                    console.error(message);
                } else if (method === 'warn') {
                    console.warn(message);
                } else if (method === 'info') {
                    console.info(message);
                } else {
                    console.log(message);
                }
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