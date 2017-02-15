module.exports = {
    /**
     * @apiDefine ErrorSpielplanUngueltig Spielplan ist ungültig
     *
     * @apiError (SpielplanUngueltig) {String} MESSAGE Error-Message: 'Spielplan Ungueltig'
     * @apiError (SpielplanUngueltig) {Integer} STATUSCODE Status-Code: 409
     * @apiError (SpielplanUngueltig) {String} MESSAGEKEY Key der Message: 'ERROR_SPIELPLAN_UNGUELTIG'
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 409 Conflict
     *     {
     *          "MESSAGE": "Spielplan Ungueltig",
     *          "STATUSCODE": 409,
     *          "MESSAGEKEY": "ERROR_SPIELPLAN_UNGUELTIG"
     *     }
     */
    MESSAGE: 'Spielplan Ungueltig',
    STATUSCODE: 409,
    MESSAGEKEY: 'ERROR_SPIELPLAN_UNGUELTIG'
};