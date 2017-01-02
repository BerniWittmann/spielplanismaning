module.exports = {
    /**
     * @apiDefine ErrorForbiddenMessage
     *
     * @apiError (Forbidden) {String} MESSAGE Error-Message: 'Forbidden'
     * @apiError (Forbidden) {Integer} STATUSCODE Status-Code: 403
     * @apiError (Forbidden) {String} MESSAGEKEY Key der Message: 'ERROR_FORBIDDEN'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 403 Forbidden
     *     {
     *          "MESSAGE": "Forbidden",
     *          "STATUSCODE": 403,
     *          "MESSAGEKEY": "ERROR_FORBIDDEN"
     *     }
     */
    MESSAGE: 'Forbidden',
    STATUSCODE: 403,
    MESSAGEKEY: 'ERROR_FORBIDDEN'
};