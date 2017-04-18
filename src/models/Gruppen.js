const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../config/constants.js');

const GruppenSchema = new mongoose.Schema({
    name: String,
    teams: [{type: Schema.ObjectId, ref: 'Team'}],
    jugend: {type: Schema.ObjectId, ref: 'Jugend'},
    type: String
});

GruppenSchema.methods.pushTeams = function (team, cb) {
    this.teams.push(team);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

GruppenSchema.methods.setType = function (type) {
    this.type = _.includes(constants.GRUPPEN_TYPES, type) ? type : undefined;
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
GruppenSchema.plugin(deepPopulate, {});

mongoose.model('Gruppe', GruppenSchema);