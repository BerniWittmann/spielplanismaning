module.exports = {
    /**
     * @apiDefine ErrorNotAuthorizedMessage
     *
     * @apiError (NotAuthorized) {String} MESSAGE Error-Message: 'Not Authorized'
     * @apiError (NotAuthorized) {Integer} STATUSCODE Status-Code: 401
     * @apiError (NotAuthorized) {String} MESSAGEKEY Key der Message: 'ERROR_NOT_AUTHORIZED'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 401 Unauthorized
     *     {
     *          "MESSAGE": "Not Authorized",
     *          "STATUSCODE": 401,
     *          "MESSAGEKEY": "ERROR_NOT_AUTHORIZED"
     *     }
     */
    MESSAGE: 'Not Authorized',
    STATUSCODE: 401,
    MESSAGEKEY: 'ERROR_NOT_AUTHORIZED'
};