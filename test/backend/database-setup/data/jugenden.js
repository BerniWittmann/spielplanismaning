const ids = require('./ids');

const data = [{
    _id: ids.jugend,
    gruppen: ids.gruppen,
    teams: ids.teams,
    color: 'blau',
    name: 'Jugend',
    veranstaltung: ids.veranstaltung
}];

module.exports = {
    data: data
};