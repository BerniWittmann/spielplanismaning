module.exports = function () {
    var _ = require('lodash');
    var arr = {
        '/api/email': {
            POST: ['admin']
        },
        '/api/email/subscriber': {
            GET: ['admin']
        },
        '/api/gruppen': {
            POST: ['admin'],
            DELETE: ['admin']
        },
        '/api/teams': {
            POST: ['admin'],
            DELETE: ['admin'],
            PUT: ['admin']
        },
        '/api/teams/resetErgebnisse': ['admin'],
        '/api/jugenden': {
            POST: ['admin'],
            DELETE: ['admin']
        },
        '/api/spiele': {
            POST: ['admin'],
            DELETE: ['admin']
        },
        '/api/spiele/alle': ['admin'],
        '/api/spiele/tore': {
            PUT: ['bearbeiter', 'admin'],
            DELETE: ['bearbeiter', 'admin']
        },
        '/api/spielplan': {
            PUT: ['admin']
        },
        '/api/spielplan/zeiten': {
            PUT: ['admin']
        },
        '/api/spielplan/ausnahmen': ['admin'],
        '/api/users/register': ['admin'],
        '/api/users/delete': ['admin'],
        '/api/users/userDetails': ['bearbeiter', 'admin']
    };

    return {
        getRequiredRoles: function (path, method) {
            //Cut off slash at the end
            if(_.isEqual(path.slice(-1), '/')) {
                path = path.substring(0, path.length - 1);
            }
            var route = arr[path];

            if (_.isArray(route)) {
                return route;
            }

            if (_.isString(route)) {
                return route.split(' ');
            }

            if (_.isUndefined(route) || _.isNull(route)) {
                return [];
            }

            var roles = route[method];

            if (_.isArray(roles)) {
                return roles;
            }

            if (_.isString(roles)) {
                return roles.split(' ');
            }

            return [];
        },
        routes: arr
    };
};