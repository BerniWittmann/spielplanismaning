const ids = require('./ids');

const data = [];

for(let i = 0; i < 6; i++) {
    data.push({
        _id: ids.teams[i],
        jugend: ids.jugend,
        name: 'Team ' + (i + 1),
        isPlaceholder: false,
        veranstaltung: ids.veranstaltung,
        gruppe: ids.gruppen[i < 3 ? 0 : 1]
    });
}

module.exports = {
    data: data
};