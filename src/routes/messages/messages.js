module.exports = function () {
    function send(obj, res) {
        return res.status(obj.STATUSCODE).json(obj);
    }

    return {
        Success: function (res) {
            send(require('./SuccessMessage.js'), res);
        },
        Deleted: function (res) {
            send(require('./DeleteMessage.js'), res);
        },
        Error: function (res, err) {
            send(require('./ErrorMessage.js')(err), res);
        },
        ErrorGruppeNotFound: function (res, err) {
            send(require('./ErrorGruppeNotFoundMessage.js')(err), res);
        },
        ErrorMaxZahlGruppe: function (res) {
            send(require('./ErrorMaxZahlGruppe.js'), res);
        },
        SpielplanErstellt: function (res) {
            send(require('./SpielplanErstelltMessage.js'), res);
        },
        Reset: function (res) {
            send(require('./ResetMessage.js'), res);
        },
        ErrorFehlendeFelder: function (res) {
            send(require('./ErrorFehlendeFelder.js'), res);
        },
        ErrorUnbekannteRolle: function (res) {
            send(require('./ErrorUnbekannteRolle.js'), res);
        },
        ErrorFalscheAnmeldedaten: function (res) {
            send(require('./ErrorFalscheAnmeldedaten.js'), res);
        },
        ErrorUserNichtLoeschbar: function (res) {
            send(require('./ErrorFalscheAnmeldedaten.js'), res);
        },
        ErrorUserNotFound: function (res, username) {
            send(require('./ErrorUserNotFound.js')(username), res);
        }
    };
};