module.exports = function (username) {
    /**
     * @apiDefine ErrorUserNotFound  Benutzer wurde nicht gefunden
     *
     * @apiError (UserNotFound) {String} MESSAGE Error-Message: 'Benutzer {Nutzername} wurde nicht gefunden'
     * @apiError (UserNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (UserNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_USER_NOT_FOUND'
     *
     * @apiErrorExample Error-Response UserNotFound:
     *     HTTP/1.1 404 Not Found
     *     {
     *          "MESSAGE": "Benutzer test wurde nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_USER_NOT_FOUND"
     *     }
     */
    return {
        MESSAGE: 'Benutzer ' + username +' wurde nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_USER_NOT_FOUND'
    };
};