module.exports = function (err) {
    /**
     * @apiDefine ErrorGruppeNotFoundMessage
     *
     * @apiError GruppeNotFound Gruppe wurde nicht gefunden
     *
     * @apiError {String} MESSAGE Error-Messge: 'Error'
     * @apiError {Integer} STATUSCODE Status-Code: 200
     * @apiError {String} MESSAGEKEY Key der Message: 'SUCCESS_DELETE_MESSAGE'
     * @apiError {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 500 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Gruppe nicht gefunden",
     *          "STATUSCODE": 500,
     *          "MESSAGEKEY": "ERROR_GROUP_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Gruppe nicht gefunden',
        STATUSCODE: 500,
        MESSAGEKEY: 'ERROR_GROUP_NOT_FOUND',
        ERROR: err
    }
};