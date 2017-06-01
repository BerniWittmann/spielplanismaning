module.exports = {
    /**
     * @apiDefine ErrorSpielplanDisabled
     *
     * @apiError (Deprecated) {String} MESSAGE Error-Message: 'Spielplan Verwaltung ist deaktiviert.'
     * @apiError (Deprecated) {Integer} STATUSCODE Status-Code: 410
     * @apiError (Deprecated) {String} MESSAGEKEY Key der Message: 'ERROR_SPIELPLAN_DISABLED'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 420 Policy Not Fullfilled
     *     {
     *          "MESSAGE": "Spielplan Verwaltung ist deaktiviert.",
     *          "STATUSCODE": 420,
     *          "MESSAGEKEY": "ERROR_SPIELPLAN_DISABLED"
     *     }
     */
    MESSAGE: 'Spielplan Verwaltung ist deaktiviert.',
    STATUSCODE: 420,
    MESSAGEKEY: 'ERROR_SPIELPLAN_DISABLED'
};