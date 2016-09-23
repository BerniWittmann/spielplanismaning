module.exports = {
    /**
     * @apiDefine SpielplanErstelltMessage
     *
     * @apiSuccess {String} MESSAGE Success-Message: 'Spielplan Erstellt'
     * @apiSuccess {Integer} STATUSCODE Status-Code: 200
     * @apiSuccess {String} MESSAGEKEY Key der Message: 'SPIELPLAN_CREATED_MESSAGE'
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          "MESSAGE": "Spielplan Erstellt",
     *          "STATUSCODE": 200,
     *          "MESSAGEKEY": "SPIELPLAN_CREATED_MESSAGE"
     *     }
     */
    MESSAGE: 'Spielplan Erstellt',
    STATUSCODE: 200,
    MESSAGEKEY: 'SPIELPLAN_CREATED_MESSAGE'
};