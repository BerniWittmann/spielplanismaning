module.exports = {
    /**
     * @apiDefine ErrorUserNichtLoschbar
     *
     * @apiError UserNichtLoschbar Benutzer kann nicht gelöscht werden
     *
     * @apiError {String} MESSAGE Error-Messge: 'Benutzer kann nicht gelöscht werden'
     * @apiError {Integer} STATUSCODE Status-Code: 403
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_USER_NICHT_LOESCHBAR'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *          "MESSAGE": "Benutzer kann nicht gelöscht werden",
     *          "STATUSCODE": 403,
     *          "MESSAGEKEY": "ERROR_USER_NICHT_LOESCHBAR"
     *     }
     */
    MESSAGE: 'Benutzer kann nicht gelöscht werden',
    STATUSCODE: 403,
    MESSAGEKEY: 'ERROR_USER_NICHT_LOESCHBAR'
};