module.exports = {
    /**
     * @apiDefine ErrorUserNichtLoeschbar
     *
     * @apiError (UserNichtLoeschbar) {String} MESSAGE Error-Message: 'Benutzer kann nicht gelöscht werden'
     * @apiError (UserNichtLoeschbar) {Integer} STATUSCODE Status-Code: 403
     * @apiError (UserNichtLoeschbar) {String} MESSAGEKEY Key der Message: 'ERROR_USER_NICHT_LOESCHBAR'
     *
     * @apiErrorExample Error-Response UserNichtLoeschbar:
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