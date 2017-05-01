const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const async = require('async');
const _ = require('lodash');

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
    complex: {
        hz1: {
            toreA: Number,
            toreB: Number
        },
        hz2: {
            toreA: Number,
            toreB: Number
        },
        hz3: {
            toreA: Number,
            toreB: Number
        }
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
    },
    fromA: {
        type: Schema.ObjectId,
        refPath: 'fromType'
    },
    fromB: {
        type: Schema.ObjectId,
        refPath: 'fromType'
    },
    fromType: String,
    rankA: Number,
    rankB: Number,
    label: String
});

SpielSchema.methods.setToreNormal = function (toreA, toreB, cb) {
    this.setToreA(toreA, function (err, spiel) {
        if (err) {
            return cb(err);
        }

        spiel.setToreB(toreB, function (err, spiel) {
            if (err) {
                return cb(err);
            }

            if (spiel.toreA > spiel.toreB) {
                spiel.setPunkte(2, 0, function (err, spiel) {
                    if (err) {
                        return cb(err);
                    }

                    spiel.save(cb);
                });
            } else if (spiel.toreA < spiel.toreB) {
                spiel.setPunkte(0, 2, function (err, spiel) {
                    if (err) {
                        return cb(err);
                    }
                    spiel.save(cb);
                });
            } else {
                spiel.setPunkte(1, 1, function (err, spiel) {
                    if (err) {
                        return cb(err);
                    }
                    spiel.save(cb);
                });
            }
        });
    });
};

SpielSchema.methods.setToreComplex = function(data, cb) {
    if (!data.complex || !data.complex.hz1 || !data.complex.hz2 ) {
        return cb(new Error('Keine Halbzeit Daten gefunden'));
    }

    this.set('complex', {
        hz1: data.complex.hz1,
        hz2: data.complex.hz2,
        hz3: data.complex.hz3
    });

    let punkteA = 0;
    let punkteB = 0;
    let toreA = 0;
    let toreB = 0;

    _.forEach(['hz1', 'hz2', 'hz3'], function (hz) {
        const hzData = data.complex[hz];

        if (hzData && hzData.toreA && hzData.toreB && hzData.toreA >= 0 && hzData.toreB >= 0) {
            if (hzData.toreA > hzData.toreB) {
                punkteA++;
            } else if (hzData.toreA < hzData.toreB) {
                punkteB++;
            } else {
                punkteA++;
                punkteB++;
            }
            toreA += hzData.toreA;
            toreB += hzData.toreB;
        }
    });

    return this.setPunkte(punkteA, punkteB, function (err, spiel) {
        if (err) {
            return cb(err);
        }

        spiel.set('toreA', toreA);
        spiel.set('toreB', toreB);
        spiel.save(cb);
    });
};

SpielSchema.methods.setTore = function (data, cb) {
    if (process.env.SPIEL_MODE === 'complex') {
        return this.setToreComplex(data, cb);
    }
    return this.setToreNormal(data.toreA, data.toreB, cb);
};

SpielSchema.methods.reset = function (cb) {
    this.setToreA(0, function (err, spiel) {
        if (err) {
            return cb(err);
        }

        spiel.setToreB(0, function (err, spiel) {
            if (err) {
                return cb(err);
            }

            spiel.resetHalbzeiten(function (err, spiel) {
                if (err) return cb(err);

                spiel.resetPunkte(function (err, spiel) {
                    if (err) {
                        return cb(err);
                    }

                    spiel.save(cb);
                });
            });
        });
    });
};

SpielSchema.methods.resetHalbzeiten = function (cb) {
    this.set('complex', {
        hz1: {
            toreA: 0,
            toreB: 0
        },
        hz2: {
            toreA: 0,
            toreB: 0
        },
        hz3: {
            toreA: 0,
            toreB: 0
        }
    });
    this.save(cb);
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

            if (spiel.punkteA > spiel.punkteB) {
                spiel.unentschieden = false;
                spiel.gewinner = spiel.teamA;
            } else if (spiel.punkteA < spiel.punkteB ) {
                spiel.unentschieden = false;
                spiel.gewinner = spiel.teamB;
            } else if (spiel.punkteA === spiel.punkteB) {
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

SpielSchema.statics.updateTeamInSpiele = function (oldTeam, newTeam, cb) {
    const self = this;
    return async.each(['teamA', 'teamB'], function (t, next) {
        const query = {
            beendet: false
        };
        const update = {};
        query[t] = oldTeam;
        update[t] = newTeam;
        self.update(query, update, {multi: true}, next);
    }, cb);
};

SpielSchema.methods.fill = function (cb) {
    const self = this;
    return async.each(['teamA', 'teamB', 'gewinner'], function (t, next) {
        if (self[t] && self[t]._id) {
            return self[t].fill(function (err, team) {
                if (err) return cb(err);

                self.set(t, team);
                return next();
            });
        }
        return next();
    }, function (err) {
        if (err) return cb(err);

        return cb(null, self);
    });
};

const deepPopulate = require('mongoose-deep-populate')(mongoose);
SpielSchema.plugin(deepPopulate, {});

mongoose.model('Spiel', SpielSchema);