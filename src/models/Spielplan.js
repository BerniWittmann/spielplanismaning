const mongoose = require('mongoose');

const SpielPlanSchema = new mongoose.Schema({
    startzeit: String, //10:40
    spielzeit: Number,
    pausenzeit: Number,
    endzeit: String, //10:40
    startdatum: String, //01.01.1970
    enddatum: String //01.01.1970
});

const deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

SpielPlanSchema.methods.fill = function (cb) {
    return cb(null, this);
};

mongoose.model('Spielplan', SpielPlanSchema);