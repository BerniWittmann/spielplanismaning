module.exports = function (err) {
    /**
     * @apiDefine ErrorGruppeNotFoundMessage
     *
     * @apiError (GruppeNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (GruppeNotFound) {Integer} STATUSCODE Status-Code: 200
     * @apiError (GruppeNotFound) {String} MESSAGEKEY Key der Message: 'SUCCESS_DELETE_MESSAGE'
     * @apiError (GruppeNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response GruppeNotFound:
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