module.exports = function (err) {
    /**
     * @apiDefine ErrorMessage
     *
     * @apiError (Error) {String} MESSAGE Error-Message: 'Error'
     * @apiError (Error) {Integer} STATUSCODE Status-Code: 200
     * @apiError (Error) {String} MESSAGEKEY Key der Message: 'ERROR_MESSAGE'
     * @apiError (Error) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response Error:
     *     HTTP/1.1 500 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Error",
     *          "STATUSCODE": 500,
     *          "MESSAGEKEY": "ERROR_MESSAGE",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Error',
        STATUSCODE: 500,
        MESSAGEKEY: 'ERROR',
        ERROR: err
    }
};