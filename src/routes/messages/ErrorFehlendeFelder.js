module.exports = {
    /**
     * @apiDefine ErrorFehlendeFelder
     * 
     * @apiError (FehlendeFelder) {String} MESSAGE Error-Message: 'Maximalzahl an Gruppen für diese Jugend erreicht'
     * @apiError (FehlendeFelder) {Integer} STATUSCODE Status-Code: 400
     * @apiError (FehlendeFelder) {String} MESSAGEKEY Key der Message: 'ERROR_FEHLENDE_FELDER'
     *
     * @apiErrorExample Error-Response FehlendeFelder:
     *     HTTP/1.1 400 Bad Request
     *     {
     *          "MESSAGE": "Es wurden nicht alle Felder ausgefüllt. Benutzername oder/und Passwort fehlen",
     *          "STATUSCODE": 400,
     *          "MESSAGEKEY": "ERROR_FEHLENDE_FELDER"
     *     }
     */
    MESSAGE: 'Es wurden nicht alle Felder ausgefüllt. Benutzername oder/und Passwort fehlen',
    STATUSCODE: 400,
    MESSAGEKEY: 'ERROR_FEHLENDE_FELDER'
};