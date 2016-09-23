module.exports = {
    /**
     * @apiDefine ErrorFalscheAnmeldedaten
     *
     * @apiError FalscheAnmeldedaten Falsche Anmeldedaten. Benutzername oder/und Passwort sind falsch
     *
     * @apiError {String} MESSAGE Error-Messge: 'Falsche Anmeldedaten. Benutzername oder/und Passwort sind falsch'
     * @apiError {Integer} STATUSCODE Status-Code: 401
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_FALSCHE_ANMELDEDATEN'
     *
     * @apiErrorExample Error-Response:
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