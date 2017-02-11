module.exports = function (err) {
    /**
     * @apiDefine ErrorAnsprechpartnerNotFoundMessage
     *
     * @apiError (AnsprechpartnerNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (AnsprechpartnerNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (AnsprechpartnerNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_ANSPRECHPARTNER_NOT_FOUND'
     * @apiError (AnsprechpartnerNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 404 NOT FOUND
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