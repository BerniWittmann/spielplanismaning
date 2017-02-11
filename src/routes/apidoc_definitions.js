/**
 * @apiDefine TeamObject
 * @apiSuccess {Object} team Team-Object
 */

/**
 * @apiDefine GruppeObject
 * @apiSuccess {Object} gruppe Gruppe-Object
 */

/**
 * @apiDefine JugendObject
 * @apiSuccess {Object} jugend Jugend-Object
 */

/**
 * @apiDefine vResponse
 * @apiSuccess {Integer} __v Datenbank-interne Versionierung
 */

/**
 * @apiDefine teamID
 * @apiSuccess {String} team Team-ID 
 */

/**
 * @apiDefine jugendID
 * @apiSuccess {String} jugend Jugend-ID
 */

/**
 * @apiDefine spielResponse
 *
 * @apiSuccess {String} _id ID des Spiels
 * @apiSuccess {Integer} nummer Spielnummer
 * @apiSuccess {Integer} platz Platznummer
 * @apiSuccess {String} uhrzeit Uhrzeit
 * @apiSuccess {Object} gruppe Gruppe-Object
 * @apiSuccess {Object} jugend Jugend-Object
 * @apiSuccess {Object} teamA Team A
 * @apiSuccess {Object} teamB Team B
 * @apiSuccess {Integer} __v Datenbank-interne Versionierung
 * @apiSuccess {String} gewinner ID des Gewinners
 * @apiSuccess {Boolean} beendet Gibt an ob das Spiel beendet ist
 * @apiSuccess {Boolean} unentschieden Gibt an ob das Spiel unentschieden ausgegangen ist
 * @apiSuccess {Integer} punkteB Punkte des Teams B
 * @apiSuccess {Integer} punkteA Punkte des Teams A
 * @apiSuccess {Integer} toreB Tore des Teams B
 * @apiSuccess {Integer} toreA Tore des Teams A
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         _id: '57cffba355a8d45fc084c141',
 *         nummer: 1,
 *         platz: 1,
 *         uhrzeit: '09:00',
 *         gruppe: [ Object ],
 *         jugend: [ Object ],
 *         teamA: [ Object ],
 *         teamB: [ Object ],
 *         __v: 0,
 *         gewinner: '57cffb7e55a8d45fc084c12d',
 *         beendet: true,
 *         unentschieden: false,
 *         punkteB: 0,
 *         punkteA: 2,
 *         toreB: 1,
 *         toreA: 4
 *     }
 */

/**
 * @apiDefine Admin Admin
 * Für diese Funktion braucht man Admin-Rechte.
 */

/**
 * @apiDefine Bearbeiter Bearbeiter
 * Für diese Funktion braucht man Bearbeiter-Rechte.
 */

/**
 * @apiDefine Admin_Bearbeiter Admin | Bearbeiter
 * Für diese Funktion braucht man entweder Admin- oder Bearbeiter-Rechte.
 */

/**
 * @apiDefine AuthHeader Authorization Header
 * @apiHeader (Authorization Header) {String} Authorization Authorization token.
 * @apiHeaderExample {json} Authorization-Header-Example:
 *     {
 *       "Authorization": "abcdefghijklmnopqrstuvw"
 *     }
 */

/**
 * @apiDefine Deprecated
 * @apiDeprecated Dieser Endpoint wird voraussichtlich in einer der nächsten Version entfernt.
 */