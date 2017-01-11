module.exports = {
    /**
     * @apiDefine ErrorInvalidTokenMessage
     *
     * @apiError (InvalidToken) {String} MESSAGE Error-Message: 'Ungültiger Token'
     * @apiError (InvalidToken) {Integer} STATUSCODE Status-Code: 903
     * @apiError (InvalidToken) {String} MESSAGEKEY Key der Message: 'ERROR_INVALID_TOKEN'
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 903 Invalid Token
     *     {
     *          "MESSAGE": "Ungültiger Token",
     *          "STATUSCODE": 903,
     *          "MESSAGEKEY": "ERROR_INVALID_TOKEN"
     *     }
     */
    MESSAGE: 'Ungültiger Token',
    STATUSCODE: 903,
    MESSAGEKEY: 'ERROR_INVALID_TOKEN'
};