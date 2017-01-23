var mongoose = require('mongoose');

var AnsprechpartnerSchema = new mongoose.Schema({
    name: String,
    turnier: String,
    email: String
});

var deepPopulate = require('mongoose-deep-populate')(mongoose);
AnsprechpartnerSchema.plugin(deepPopulate, {});

mongoose.model('Ansprechpartner', AnsprechpartnerSchema);