const mongoose = require('mongoose');

function createID() {
    return mongoose.Types.ObjectId().toString();
}

function createIDArr(length) {
    return Array.apply(null, new Array(length)).map(function () { return createID(); });
}
module.exports = {
    veranstaltung: createID(),
    jugend: createID(),
    user: createIDArr(2),
    ansprechpartner: createIDArr(2),
    gruppen: createIDArr(2),
    teams: createIDArr(6),
    spiele: createIDArr(15),
    spielplan: createID(),
    subscribers: createIDArr(2)
};