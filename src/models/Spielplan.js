var mongoose = require('mongoose');

var SpielPlanSchema = new mongoose.Schema({
    startzeit: String, //10:40
    spielzeit: Number,
    pausenzeit: Number,
    endzeit: String, //10:40
    startdatum: String, //01.01.1970
    enddatum: String //01.01.1970
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

mongoose.model('Spielplan', SpielPlanSchema);