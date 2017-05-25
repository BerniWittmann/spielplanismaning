const ids = require('./ids');

const data = [{
    _id: ids.spielplan,
    startzeit: '09:00',
    spielzeit: 8,
    pausenzeit: 2,
    endzeit: '16:00',
    startdatum: '01.01.1970',
    enddatum: '01.01.1970',
    veranstaltung: ids.veranstaltung
}];

module.exports = {
    data: data
};