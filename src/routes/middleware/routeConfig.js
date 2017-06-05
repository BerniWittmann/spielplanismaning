const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

module.exports = {
    "/api/email": {
        "AUTH": {
            "POST": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                body: {
                    subject: Joi.string().min(3).required(),
                    text: Joi.string().min(3).required()
                }
            }
        }
    },
    "/api/email/subscriber": {
        "AUTH": {
            "GET": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                body: {
                    team: Joi.objectId().required(),
                    email: Joi.string().email().required()
                }
            },
            "DELETE": {
                query: {
                    team: Joi.objectId().required(),
                    email: Joi.string().email().required()
                }
            }
        }
    },
    "/api/email/bug": {
        "PARAMS": {
            "POST": {
                body: {
                    name: Joi.string().required(),
                    email: Joi.string().required(),
                    vorname: Joi.string().required(),
                    nachname: Joi.string().required(),
                    text: Joi.string().required(),
                    title: Joi.string().required(),
                    env: Joi.string().required(),
                    version: Joi.string().regex(/\d.\d.\d/).required(),
                    rolle: Joi.string().optional(),
                    username: Joi.string().optional(),
                    datetime: Joi.string().regex(/\d{2}.\d{2}.\d{4} \d{2}:\d{2}/).required()
                }
            }
        }
    },
    "/api/gruppen": {
        "AUTH": {
            "POST": [
                "admin"
            ],
            "DELETE": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                query: {
                    jugend: Joi.objectId().required()
                },
                body: {
                    name: Joi.string().min(3).required()
                }
            },
            "DELETE": {
                query: {
                    id: Joi.objectId().required()
                }
            }
        }
    },
    "/api/gruppen/zwischengruppe": {
        "AUTH": {
            "POST": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                query: {
                    jugend: Joi.objectId().required()
                },
                body: Joi.array().items({
                    name: Joi.string().min(3).required(),
                    teams: Joi.array().required()
                })
            }
        }
    },
    "/api/teams": {
        "AUTH": {
            "POST": [
                "admin"
            ],
            "DELETE": [
                "admin"
            ],
            "PUT": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                query: {
                    jugend: Joi.objectId().required(),
                    gruppe: Joi.objectId().required()
                },
                body: {
                    name: Joi.string().min(3).required()
                }
            },
            "DELETE": {
                query: {
                    id: Joi.objectId().required()
                }
            },
            "PUT": {
                query: {
                    id: Joi.objectId().required()
                },
                body: {
                    name: Joi.string().min(3).required()
                }
            }
        }
    },
    "/api/teams/resetErgebnisse": {
        "AUTH": [
            "admin"
        ]
    },
    "/api/teams/reloadAnmeldeObjekte": {
        "AUTH": [
            "admin"
        ]
    },
    "/api/turniere": {
        "AUTH": {
            "POST": [
                "admin"
            ],
            "DELETE": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                body: {
                    name: Joi.string().min(2).required()
                }
            },
            "DELETE": {
                query: {
                    id: Joi.objectId()
                }
            }
        }
    },
    "/api/spiele": {
        "AUTH": {
            "POST": [
                "admin"
            ],
            "DELETE": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                body: {
                    jugend: Joi.objectId().required(),
                    gruppe: Joi.objectId().required()
                }
            },
            "DELETE": {
                query: {
                    id: Joi.objectId()
                }
            }
        }
    },
    "/api/spiele/alle": {
        "AUTH": [
            "admin"
        ]
    },
    "/api/spiele/order": {
        "AUTH": [
            "admin"
        ]
    },
    "/api/spiele/tore": {
        "AUTH": {
            "PUT": [
                "bearbeiter",
                "admin"
            ],
            "DELETE": [
                "bearbeiter",
                "admin"
            ]
        },
        "PARAMS": {
            "PUT": {
                query: {
                    id: Joi.objectId().required()
                },
                body: {
                    toreA: Joi.number().min(0).optional(),
                    toreB: Joi.number().min(0).optional()
                }
            },
            "DELETE": {
                query: {
                    id: Joi.objectId().required()
                }
            }
        }
    },
    "/api/spielplan": {
        "AUTH": {
            "PUT": [
                "admin"
            ]
        },
        "PARAMS": {
            "PUT": {
                body: {
                    keep: Joi.boolean().optional()
                }
            }
        }
    },
    "/api/spielplan/zeiten": {
        "AUTH": {
            "PUT": [
                "admin"
            ]
        },
        "PARAMS": {
            "PUT": {
                body: {
                    startzeit: Joi.string().regex(/\d{2}:\d{2}/).required(),
                    spielzeit: Joi.number().min(0).required(),
                    pausenzeit: Joi.number().min(0).required(),
                    endzeit: Joi.string().regex(/\d{2}:\d{2}/).required(),
                    startdatum: Joi.string().regex(/\d{2}.\d{2}.\d{4}/).required(),
                    enddatum: Joi.string().regex(/\d{2}.\d{2}.\d{4}/).required()
                }
            }
        }
    },
    "/api/users/register": {
        "AUTH": [
            "admin"
        ],
        "PARAMS": {
            "POST": {
                body: {
                    username: Joi.string().required(),
                    email: Joi.string().email().required(),
                    role: Joi.string().required()
                }
            }
        }
    },
    "/api/users/login": {
        "PARAMS": {
            "POST": {
                body: {
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    },
    "/api/users/delete": {
        "AUTH": [
            "admin"
        ],
        "PARAMS": {
            "PUT": {
                body: {
                    username: Joi.string().required()
                }
            }
        }
    },
    "/api/users/password-forgot": {
        "PARAMS": {
            "PUT": {
                body: {
                    email: Joi.string().email().required()
                }
            }
        }
    },
    "/api/users/password-reset/check": {
        "PARAMS": {
            "PUT": {
                body: {
                    token: Joi.string().required()
                }
            }
        }
    },
    "/api/users/password-reset": {
        "PARAMS": {
            "PUT": {
                body: {
                    token: Joi.string().required(),
                    username: Joi.string().required(),
                    password: Joi.string().required()
                }
            }
        }
    },
    "/api/users/userDetails": {
        "AUTH": [
            "bearbeiter",
            "admin"
        ],
        "PARAMS": {
            "PUT": {
                body: {
                    email: Joi.string().email().required(),
                    username: Joi.string().required()
                }
            }
        }
    },
    "/api/ansprechpartner": {
        "AUTH": {
            "POST": [
                "admin"
            ],
            "PUT": [
                "admin"
            ],
            "DELETE": [
                "admin"
            ]
        },
        "PARAMS": {
            "POST": {
                body: {
                    name: Joi.string().required(),
                    turnier: Joi.string().required(),
                    email: Joi.string().email().required()
                }
            },
            "PUT": {
                query: {
                    id: Joi.objectId().required()
                },
                body: {
                    name: Joi.string().optional(),
                    turnier: Joi.string().optional(),
                    email: Joi.string().email().optional()
                },
                "DELETE": {
                    query: {
                        id: Joi.objectId().required()
                    }
                }
            }
        }
    }
};