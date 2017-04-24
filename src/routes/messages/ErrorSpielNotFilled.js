module.exports = {
    /**
     * @apiDefine ErrorSpielNotFilled
     *
     * @apiError (BadRequest) {String} MESSAGE Error-Message: 'Spiel ist noch nicht befüllt'
     * @apiError (BadRequest) {Integer} STATUSCODE Status-Code: 406
     * @apiError (BadRequest) {String} MESSAGEKEY Key der Message: 'ERROR_SPIEL_NOT_FILLED'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *          "MESSAGE": "Spiel ist noch nicht befüllt",
     *          "STATUSCODE": 406,
     *          "MESSAGEKEY": "ERROR_SPIEL_NOT_FILLED"
     *     }
     */
    MESSAGE: 'Spiel ist noch nicht befüllt',
    STATUSCODE: 406,
    MESSAGEKEY: 'ERROR_SPIEL_NOT_FILLED'
};