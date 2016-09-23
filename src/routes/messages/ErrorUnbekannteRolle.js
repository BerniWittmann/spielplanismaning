module.exports = {
    /**
     * @apiDefine ErrorUnbekannteRolle
     *
     * @apiError UnbekannteRolle Unbekannte Benutzerrolle
     *
     * @apiError {String} MESSAGE Error-Messge: 'Unbekannte Benutzerrolle'
     * @apiError {Integer} STATUSCODE Status-Code: 400
     * @apiError {String} MESSAGEKEY Key der Message: 'ERROR_UNBEKANNTE_ROLLE'
     *
     * @apiErrorExample Error-Response:
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