module.exports = {
    /**
     * @apiDefine ErrorUnbekannteRolle
     *
     * @apiError (UnbekannteRolle) {String} MESSAGE Error-Message: 'Unbekannte Benutzerrolle'
     * @apiError (UnbekannteRolle) {Integer} STATUSCODE Status-Code: 400
     * @apiError (UnbekannteRolle) {String} MESSAGEKEY Key der Message: 'ERROR_UNBEKANNTE_ROLLE'
     *
     * @apiErrorExample Error-Response UnbekannteRolle:
     *     HTTP/1.1 400 Bad Request
     *     {
     *          "MESSAGE": "Unbekannte Benutzerrolle",
     *          "STATUSCODE": 400,
     *          "MESSAGEKEY": "ERROR_UNBEKANNTE_ROLLE"
     *     }
     */
    MESSAGE: 'Unbekannte Benutzerrolle',
    STATUSCODE: 400,
    MESSAGEKEY: 'ERROR_UNBEKANNTE_ROLLE'
};