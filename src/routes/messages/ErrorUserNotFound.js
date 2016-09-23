module.exports = function (username) {
    /**
     * @apiDefine ErrorUserNotFound
     *
     * @apiError UserNotFound Benutzer wurde nicht gefunden
     *
     * @apiError {String} MESSAGE Error-Messge: 'Benutzer {Nutzername} wurde nicht gefunden'
     * @apiError {Integer} STATUSCODE Status-Code: 404
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_USER_NOT_FOUND'
     *
     * @apiErrorExample Error-Response:
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