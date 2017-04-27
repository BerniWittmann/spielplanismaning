module.exports = {
    /**
     * @apiDefine ErrorSpielNotChangeable
     *
     * @apiError (BadRequest) {String} MESSAGE Error-Message: 'Spiel kann nicht mehr geändert werden'
     * @apiError (BadRequest) {Integer} STATUSCODE Status-Code: 406
     * @apiError (BadRequest) {String} MESSAGEKEY Key der Message: 'ERROR_SPIEL_NOT_CHANGEABLE'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 406 Not Acceptable
     *     {
     *          "MESSAGE": "Spiel kann nicht mehr geändert werden",
     *          "STATUSCODE": 406,
     *          "MESSAGEKEY": "ERROR_SPIEL_NOT_CHANGEABLE"
     *     }
     */
    MESSAGE: 'Spiel kann nicht mehr geändert werden',
    STATUSCODE: 406,
    MESSAGEKEY: 'ERROR_SPIEL_NOT_CHANGEABLE'
};