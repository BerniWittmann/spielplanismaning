module.exports = {
    /**
     * @apiDefine ResetMessage
     *
     * @apiSuccess {String} MESSAGE Success-Messge: 'Successfully Reset'
     * @apiSuccess {Integer} STATUSCODE Status-Code: 200
     * @apiSuccess {String} MESSAGEKEY Key der Message: 'RESET_MESSAGE''
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          "MESSAGE": "Successfully Reset",
     *          "STATUSCODE": 200,
     *          "MESSAGEKEY": "RESET_MESSAGE"
     *     }
     */
    MESSAGE: 'Successfully Reset',
    STATUSCODE: 200,
    MESSAGEKEY: 'RESET_MESSAGE'
};