const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../config/constants.js');
const async = require('async');


const VeranstaltungenSchema = new Schema({
    name: String,
    bildUrl: String,
    spielModus: String,
    printMannschaftslisten: Boolean
});

VeranstaltungenSchema.methods.fill = function (cb) {
    return cb(null, this);
};

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
VeranstaltungenSchema.plugin(deepPopulate, {});

mongoose.model('Veranstaltung', VeranstaltungenSchema);