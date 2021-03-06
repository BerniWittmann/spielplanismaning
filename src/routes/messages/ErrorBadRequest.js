module.exports = function (reason) {
    /**
     * @apiDefine ErrorBadRequest
     *
     * @apiError (BadRequest) {String} MESSAGE Error-Message: 'Bad Request'
     * @apiError (BadRequest) {Integer} STATUSCODE Status-Code: 400
     * @apiError (BadRequest) {String} MESSAGEKEY Key der Message: 'ERROR_BAD_REQUEST'
     * @apiError (BadRequest) {Array} REASON Grund des Fehlers
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 400 Bad Request
     *     {
     *          "MESSAGE": "Bad Request",
     *          "STATUSCODE": 400,
     *          "MESSAGEKEY": "ERROR_BAD_REQUEST",
     *          "REASON": "[]"
     *     }
     */
    return {
        MESSAGE: 'Bad Request',
        STATUSCODE: 400,
        MESSAGEKEY: 'ERROR_BAD_REQUEST',
        REASON: reason
    }
};