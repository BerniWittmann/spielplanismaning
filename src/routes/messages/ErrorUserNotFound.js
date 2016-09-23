module.exports = function (username) {
    /**
     * @apiDefine ErrorUserNotFound
     *
     * @apiError UserNotFound Benutzer wurde nicht gefunden
     *
     * @apiError {String} MESSAGE Error-Messge: 'Benutzer {Nutzername} wurde nicht gefunden'
     * @apiError {Integer} STATUSCODE Status-Code: 403
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_USER_NOT_FOUND'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *          "MESSAGE": "Benutzer test wurde nicht gefunden",
     *          "STATUSCODE": 403,
     *          "MESSAGEKEY": "ERROR_USER_NOT_FOUND"
     *     }
     */
    return {
        MESSAGE: 'Benutzer ' + username +' wurde nicht gefunden',
        STATUSCODE: 403,
        MESSAGEKEY: 'ERROR_USER_NOT_FOUND'
    };
};