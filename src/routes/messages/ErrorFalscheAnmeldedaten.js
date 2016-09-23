module.exports = {
    /**
     * @apiDefine ErrorFalscheAnmeldedaten
     * 
     * @apiError (FalscheAnmeldedaten) {String} MESSAGE Error-Message: 'Falsche Anmeldedaten. Benutzername oder/und Passwort sind falsch'
     * @apiError (FalscheAnmeldedaten) {Integer} STATUSCODE Status-Code: 401
     * @apiError (FalscheAnmeldedaten) {String} MESSAGEKEY Key der Message: 'ERROR_FALSCHE_ANMELDEDATEN'
     *
     * @apiErrorExample Error-Response FalscheAnmeldedaten:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *          "MESSAGE": "Falsche Anmeldedaten. Benutzername oder/und Passwort sind falsch",
     *          "STATUSCODE": 400,
     *          "MESSAGEKEY": "ERROR_FALSCHE_ANMELDEDATEN"
     *     }
     */
    MESSAGE: 'Falsche Anmeldedaten. Benutzername oder/und Passwort sind falsch',
    STATUSCODE: 401,
    MESSAGEKEY: 'ERROR_FALSCHE_ANMELDEDATEN'
};