module.exports = function (username) {
    /**
     * @apiDefine ErrorUserExistiertBereits  Benutzer existiert bereits
     *
     * @apiError (UserExists) {String} MESSAGE Error-Message: 'Benutzer {Nutzername} existiert bereits'
     * @apiError (UserExists) {Integer} STATUSCODE Status-Code: 409
     * @apiError (UserExists) {String} MESSAGEKEY Key der Message: 'ERROR_USER_ALREADY_EXISTS'
     *
     * @apiErrorExample Error-Response UserExists:
     *     HTTP/1.1 409 Conflict
     *     {
     *          "MESSAGE": "Benutzer test existiert bereits",
     *          "STATUSCODE": 409,
     *          "MESSAGEKEY": "ERROR_USER_ALREADY_EXISTS"
     *     }
     */
    return {
        MESSAGE: 'Benutzer ' + username +' existiert bereits',
        STATUSCODE: 409,
        MESSAGEKEY: 'ERROR_USER_ALREADY_EXISTS'
    };
};