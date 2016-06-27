var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpielPlanSchema = new mongoose.Schema({
    startzeit: String //10:40	
    , spielzeit: Number
    , pausenzeit: Number
    , spiele: [
        {
            type: Schema.ObjectId
            , ref: 'Spiel'
        }
    ]
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielPlanSchema.plugin(deepPopulate, {});

mongoose.model('Spielplan', SpielPlanSchema);