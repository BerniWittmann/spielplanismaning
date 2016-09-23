module.exports = {
    /**
     * @apiDefine ErrorFehlendeFelder
     *
     * @apiError FehlendeFelder Es wurden nicht alle Felder ausgefüllt. Benutzername oder/und Passwort fehlen
     *
     * @apiError {String} MESSAGE Error-Messge: 'Maximalzahl an Gruppen für diese Jugend erreicht'
     * @apiError {Integer} STATUSCODE Status-Code: 400
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_FEHLENDE_FELDER'
     *
     * @apiErrorExample Error-Response:
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