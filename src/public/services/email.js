(function () {
    'use strict';

    angular
        .module('spi.email', [])
        .factory('email', ['$http', '$window', 'EMAIL_SUBSCRIPTION_TOKEN_NAME', function ($http, $window, EMAIL_SUBSCRIPTION_TOKEN_NAME) {
            var ENDPOINT_URL = '/api/email';
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
                    $window.localStorage[EMAIL_SUBSCRIPTION_TOKEN_NAME] = JSON.stringify(token);
                }
            };

            email.getSubscribers = function () {
                return $http.get(ENDPOINT_URL + '/subscriber').error(function (err) {
                    return err;
                }).success(function (res) {
                    return res.data;
                });
            };

            function getSubscriptionToken() {
                if (!_.isUndefined($window.localStorage[EMAIL_SUBSCRIPTION_TOKEN_NAME])) {
                    return (JSON.parse($window.localStorage[EMAIL_SUBSCRIPTION_TOKEN_NAME]) || []);
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
                    $window.localStorage[EMAIL_SUBSCRIPTION_TOKEN_NAME] = JSON.stringify(_.pullAllWith(getSubscriptionToken(), [sub], _.isEqual));
                    return res.data;
                });
            };

            return email;
        }]);

})();