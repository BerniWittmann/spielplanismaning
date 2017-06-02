const ids = require('./ids');

const data = [{
    _id: ids.veranstaltung,
    name: 'Event',
    bildUrl: '',
    spielModus: 'normal',
    printMannschaftslisten: true,
    spielplanEnabled: true
}];

module.exports = {
    data: data
};