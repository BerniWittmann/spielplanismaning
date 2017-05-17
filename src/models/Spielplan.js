const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const helper = require('./helper.js');

let SpielPlanSchema = new mongoose.Schema({
    startzeit: String, //10:40
    spielzeit: Number,
    pausenzeit: Number,
    endzeit: String, //10:40
    startdatum: String, //01.01.1970
    enddatum: String, //01.01.1970
    veranstaltung: {type: Schema.ObjectId, ref: 'Veranstaltung', required: true}
});

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

SpielPlanSchema.methods.fill = function (cb) {
    return cb(null, this);
};

SpielPlanSchema = helper.applyBeachEventMiddleware(SpielPlanSchema);

mongoose.model('Spielplan', SpielPlanSchema);