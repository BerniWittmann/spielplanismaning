module.exports = function (err) {
    /**
     * @apiDefine ErrorSpielNotFoundMessage
     *
     * @apiError (SpielNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (SpielNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (SpielNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_SPIEL_NOT_FOUND'
     * @apiError (SpielNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response SpielNotFound:
     *     HTTP/1.1 404 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Spiel nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_SPIEL_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Spiel nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_SPIEL_NOT_FOUND',
        ERROR: err
    };
};