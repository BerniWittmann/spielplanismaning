angular
    .module('spi.email', []).factory('email', ['$http', '$window', function ($http, $window) {
    var TOKENNAME = 'spielplan-ismaning-subscriptions';
    var ENDPOINT_URL = '/email';
    var email = {};

    email.send = function (email) {
        return $http.post(ENDPOINT_URL, email).success(function (res) {
            return res.data;
        });
    };

    email.addSubscriber = function (abonnent) {
        return $http.post(ENDPOINT_URL + '/subscriber', abonnent).error(function (err) {
            return err;
        }).success(function (res) {
            email.addSubscriptionToken(abonnent);
            return res.data;
        });
    };

    email.addSubscriptionToken = function (sub) {
        if (!email.checkSubscription(sub)) {
            var token = getSubscriptionToken();
            token.push(sub);
            $window.localStorage[TOKENNAME] = JSON.stringify(token);
        }
    };

    email.getSubscribers = function () {
        return $http.get('/email/subscriber').error(function (err) {
            return err;
        }).success(function (res) {
            return res.data;
        });
    };

    function getSubscriptionToken() {
        if ($window.localStorage[TOKENNAME]) {
            return (JSON.parse($window.localStorage[TOKENNAME]) || []);
        }
        return [];
    }

    email.getSubscriptionByTeam = function (o) {
        return _.filter(getSubscriptionToken(), {
            'team': o.team
        });
    };

    email.checkSubscription = function (sub) {
        var result = false;
        _.forEach(getSubscriptionToken(), function (s) {
            if (_.isEqual(s.team, sub.team) && (_.isUndefined(sub.email) || _.isEqual(s.email, sub.email))) {
                result = true;
            }
        });
        return result;
    };

    email.removeSubscription = function (sub) {
        return $http.delete(ENDPOINT_URL + '/subscriber?email=' + sub.email + '&team=' + sub.team).error(function (err) {
            console.log(err);
            return err;
        }).then(function (res) {
            $window.localStorage[TOKENNAME] = JSON.stringify(_.pullAllWith(getSubscriptionToken(), [sub], _.isEqual));
            return res.data;
        })
    };

    return email;
}]);