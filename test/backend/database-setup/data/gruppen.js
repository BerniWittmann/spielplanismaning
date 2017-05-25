const ids = require('./ids');

const data = [{
    _id: ids.gruppen[0],
    jugend: ids.jugend,
    type: 'normal',
    teams: [ids.teams[0], ids.teams[1], ids.teams[2]],
    veranstaltung: ids.veranstaltung
}, {
    _id: ids.gruppen[1],
    jugend: ids.jugend,
    type: 'normal',
    teams: [ids.teams[3], ids.teams[4], ids.teams[5]],
    veranstaltung: ids.veranstaltung
}];

module.exports = {
    data: data
};