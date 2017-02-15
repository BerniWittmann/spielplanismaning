module.exports = function (spiele) {
    /**
     * @apiDefine SpielplanAktualisiertMessage
     *
     * @apiSuccess {String} MESSAGE Success-Message: 'Spielplan Aktualisiert'
     * @apiSuccess {Integer} STATUSCODE Status-Code: 200
     * @apiSuccess {String} MESSAGEKEY Key der Message: 'SPIELPLAN_UPDATED_MESSAGE'
     * @apiSuccess {Object} GAMES Die Spiele in korrekter Reihenfolge
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          "MESSAGE": "Spielplan Aktualisiert",
     *          "STATUSCODE": 200,
     *          "MESSAGEKEY": "SPIELPLAN_UPDATED_MESSAGE"
     *          "GAMES": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Spielplan Aktualisiert',
        STATUSCODE: 200,
        MESSAGEKEY: 'SPIELPLAN_UPDATED_MESSAGE',
        GAMES: spiele
    }
};