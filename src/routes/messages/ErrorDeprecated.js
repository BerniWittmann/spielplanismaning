module.exports = {
    /**
     * @apiDefine ErrorDeprecated
     *
     * @apiError (Deprecated) {String} MESSAGE Error-Message: 'Endpoint is deprecated'
     * @apiError (Deprecated) {Integer} STATUSCODE Status-Code: 410
     * @apiError (Deprecated) {String} MESSAGEKEY Key der Message: 'ERROR_DEPRECATED'
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 410 Gone
     *     {
     *          "MESSAGE": "Endpoint is deprecated",
     *          "STATUSCODE": 410,
     *          "MESSAGEKEY": "ERROR_DEPRECATED"
     *     }
     */
    MESSAGE: 'Endpoint is deprecated',
    STATUSCODE: 410,
    MESSAGEKEY: 'ERROR_DEPRECATED'
};