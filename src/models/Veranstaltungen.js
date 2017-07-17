const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require('../config/constants.js');
const async = require('async');
const URLSlugs = require('mongoose-url-slugs');
const helper = require('./helper.js');

const VeranstaltungenSchema = new Schema({
    name: String,
    bildUrl: String,
    spielModus: String,
    printModus: String,
    printMannschaftslisten: Boolean,
    spielplanEnabled: Boolean
});

VeranstaltungenSchema.plugin(URLSlugs('name', {update: false}));

VeranstaltungenSchema.methods.fill = function (cb) {
    return cb(null, this);
};

const deepPopulate = require('../config/mongoose-deep-populate')(mongoose);
VeranstaltungenSchema.plugin(deepPopulate, {});

mongoose.model('Veranstaltung', VeranstaltungenSchema);