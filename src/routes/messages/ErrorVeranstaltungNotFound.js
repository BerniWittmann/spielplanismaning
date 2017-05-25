module.exports = function (err) {
    /**
     * @apiDefine ErrorVeranstaltungNotFoundMessage
     *
     * @apiError (AnsprechpartnerNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (AnsprechpartnerNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (AnsprechpartnerNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_VERANSTALTUNG_NOT_FOUND'
     * @apiError (AnsprechpartnerNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 404 NOT FOUND
     *     {
     *          "MESSAGE": "Veranstaltung nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_VERANSTALTUNG_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Veranstaltung nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_VERANSTALTUNG_NOT_FOUND',
        ERROR: err
    };
};