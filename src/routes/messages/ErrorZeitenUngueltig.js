module.exports = {
    /**
     * @apiDefine ErrorZeitenUngueltig
     *
     * @apiError (ZeitenUngueltig) {String} MESSAGE Error-Message: 'Zeiten ungültig'
     * @apiError (ZeitenUngueltig) {Integer} STATUSCODE Status-Code: 400
     * @apiError (ZeitenUngueltig) {String} MESSAGEKEY Key der Message: 'ERROR_ZEITEN_UNGUELTIG'
     *
     * @apiErrorExample Error-Response ZeitenUngueltig:
     *     HTTP/1.1 400 Bad Request
     *     {
     *          "MESSAGE": "Zeiten ungültig",
     *          "STATUSCODE": 400,
     *          "MESSAGEKEY": "ERROR_ZEITEN_UNGUELTIG"
     *     }
     */
    MESSAGE: 'Zeiten ungültig',
    STATUSCODE: 400,
    MESSAGEKEY: 'ERROR_ZEITEN_UNGUELTIG'
};