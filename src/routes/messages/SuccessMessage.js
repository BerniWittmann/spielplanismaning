module.exports = {
    /**
     * @apiDefine SuccessMessage
     *
     * @apiSuccess {String} MESSAGE Success-Message: 'Success'
     * @apiSuccess {Integer} STATUSCODE Status-Code: 200
     * @apiSuccess {String} MESSAGEKEY Key der Message: 'SUCCESS_MESSAGE''
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *          "MESSAGE": "Success",
     *          "STATUSCODE": 200,
     *          "MESSAGEKEY": "SUCCESS_MESSAGE"
     *     }
     */
    MESSAGE: 'Success',
    STATUSCODE: 200,
    MESSAGEKEY: 'SUCCESS_MESSAGE'
};