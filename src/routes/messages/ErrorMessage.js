module.exports = function (err) {
    /**
     * @apiDefine ErrorMessage
     *
     * @apiError Error Ein Fehler ist aufgetreten
     *
     * @apiError {String} MESSAGE Error-Messge: 'Error'
     * @apiError {Integer} STATUSCODE Status-Code: 200
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_MESSAGE'
     * @apiError {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response:
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