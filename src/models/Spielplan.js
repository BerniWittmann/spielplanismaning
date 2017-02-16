var mongoose = require('mongoose');

var SpielPlanSchema = new mongoose.Schema({
    startzeit: String, //10:40
    spielzeit: Number,
    pausenzeit: Number
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

mongoose.model('Spielplan', SpielPlanSchema);