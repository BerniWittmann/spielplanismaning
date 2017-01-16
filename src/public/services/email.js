(function () {
    'use strict';

    angular
        .module('spi.email', ['spi.routes'])
        .factory('email', ['routes', '$window', 'EMAIL_SUBSCRIPTION_TOKEN_NAME', function (routes, $window, EMAIL_SUBSCRIPTION_TOKEN_NAME) {
            var email = {};

            email.send = function (email) {
                return routes.request({method: routes.methods.POST, url: routes.urls.email.base(), data: email});
            };

            email.addSubscriber = function (abonnent) {
                return routes.request({
                    method: routes.methods.POST,
                    url: routes.urls.email.subscriber(),
                    data: abonnent
                }).then(function (res) {
                    email.addSubscriptionToken(abonnent);
                    return res;
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
                return routes.request({method: routes.methods.GET, url: routes.urls.email.subscriber()});
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
                return routes.request({
                    method: routes.methods.DELETE,
                    url: routes.urls.email.subscriber(),
                    params: {email: sub.email, team: sub.team}
                }).then(function (res) {
                    $window.localStorage[EMAIL_SUBSCRIPTION_TOKEN_NAME] = JSON.stringify(_.pullAllWith(getSubscriptionToken(), [sub], _.isEqual));
                    return res;
                });
            };

            return email;
        }]);

})();