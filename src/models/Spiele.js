const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SpielSchema = new mongoose.Schema({
    nummer: Number,
    platz: Number,
    datum: String, //01.01.1970
    uhrzeit: String, //10:40
    gruppe: {
        type: Schema.ObjectId,
        ref: 'Gruppe'
    },
    jugend: {
        type: Schema.ObjectId,
        ref: 'Jugend'
    },
    teamA: {
        type: Schema.ObjectId,
        ref: 'Team'
    },
    teamB: {
        type: Schema.ObjectId,
        ref: 'Team'
    },
    toreA: {
        type: Number,
        default: 0
    },
    toreB: {
        type: Number,
        default: 0
    },
    punkteA: {
        type: Number,
        default: 0
    },
    punkteB: {
        type: Number,
        default: 0
    },
    gewinner: {
        type: Schema.ObjectId,
        ref: 'Team'
    },
    unentschieden: {
        type: Boolean,
        default: false
    },
    beendet: {
        type: Boolean,
        default: false
    }
});

SpielSchema.methods.setTore = function (toreA, toreB, cb) {
    this.setToreA(toreA, function (err, spiel) {
        if (err) {
            throw err;
        }

        spiel.setToreB(toreB, function (err, spiel) {
            if (err) {
                throw err;
            }

            if (spiel.toreA > spiel.toreB) {
                spiel.setPunkte(2, 0, function (err, spiel) {
                    if (err) {
                        throw err;
                    }

                    spiel.save(cb);
                });
            } else if (spiel.toreA < spiel.toreB) {
                spiel.setPunkte(0, 2, function (err, spiel) {
                    if (err) {
                        throw err;
                    }
                    spiel.save(cb);
                });
            } else {
                spiel.setPunkte(1, 1, function (err, spiel) {
                    if (err) {
                        throw err;
                    }
                    spiel.save(cb);
                });
            }
        });
    });
};

SpielSchema.methods.reset = function (cb) {
    this.setToreA(0, function (err, spiel) {
        if (err) {
            throw err;
        }

        spiel.setToreB(0, function (err, spiel) {
            if (err) {
                throw err;
            }
            spiel.resetPunkte(function (err, spiel) {
                if (err) {
                    throw err;
                }

                spiel.save(cb);
            });
        });
    });
};

SpielSchema.methods.setToreA = function (toreA, cb) {
    //noinspection JSUnresolvedFunction
    this.set('toreA', toreA);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

SpielSchema.methods.setToreB = function (toreB, cb) {
    //noinspection JSUnresolvedFunction
    this.set('toreB', toreB);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

SpielSchema.methods.setPunkte = function (punkteA, punkteB, cb) {
    this.setPunkteA(punkteA, function (err, spiel) {
        if (err) {
            throw err;
        }

        spiel.setPunkteB(punkteB, function (err, spiel) {
            if (err) {
                throw err;
            }

            if (spiel.punkteA === 2 && spiel.punkteB === 0) {
                spiel.unentschieden = false;
                spiel.gewinner = spiel.teamA;
            } else if (spiel.punkteA === 0 && spiel.punkteB === 2) {
                spiel.unentschieden = false;
                spiel.gewinner = spiel.teamB;
            } else if (spiel.punkteA === 1 && spiel.punkteB === 1) {
                spiel.unentschieden = true;
            }
            spiel.beendet = true;
            spiel.save(cb);
        });
    });
};

SpielSchema.methods.resetPunkte = function (cb) {
    this.setPunkteA(0, function (err, spiel) {
        if (err) {
            throw err;
        }

        spiel.setPunkteB(0, function (err, spiel) {
            if (err) {
                throw err;
            }

            spiel.unentschieden = false;
            spiel.gewinner = undefined;
            spiel.beendet = false;
            spiel.save(cb);
        });
    });
};

SpielSchema.methods.setPunkteA = function (punkteA, cb) {
    //noinspection JSUnresolvedFunction
    this.set('punkteA', punkteA);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

SpielSchema.methods.setPunkteB = function (punkteB, cb) {
    //noinspection JSUnresolvedFunction
    this.set('punkteB', punkteB);
    //noinspection JSUnresolvedFunction
    this.save(cb);
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielSchema.plugin(deepPopulate, {});

mongoose.model('Spiel', SpielSchema);