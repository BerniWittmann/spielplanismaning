module.exports = function (err) {
    /**
     * @apiDefine ErrorAnsprechpartnerNotFoundMessage
     *
     * @apiError (JugendNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (JugendNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (JugendNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_ANSPRECHPARTNER_NOT_FOUND'
     * @apiError (JugendNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 404 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Ansprechpartner nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_ANSPRECHPARTNER_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Ansprechpartner nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_ANSPRECHPARTNER_NOT_FOUND',
        ERROR: err
    };
};