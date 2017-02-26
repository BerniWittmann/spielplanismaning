(function () {
    'use strict';

    angular
        .module('spi.email', ['spi.routes', 'spi.storage'])
        .factory('email', ['routes', 'storage', 'EMAIL_SUBSCRIPTION_TOKEN_NAME', function (routes, storage, EMAIL_SUBSCRIPTION_TOKEN_NAME) {
            const email = {};

            email.send = function (email) {
                return routes.requestPOST(routes.urls.email.base(), email);
            };

            email.sendBugReport = function (data) {
                return routes.requestPOST(routes.urls.email.bug(), data);
            };

            email.addSubscriber = function (abonnent) {
                return routes.requestPOST(routes.urls.email.subscriber(), abonnent).then(function (res) {
                    email.addSubscriptionToken(abonnent);
                    return res;
                });
            };

            email.addSubscriptionToken = function (sub) {
                if (!email.checkSubscription(sub)) {
                    const token = getSubscriptionToken();
                    token.push(sub);
                    storage.set(EMAIL_SUBSCRIPTION_TOKEN_NAME, JSON.stringify(token));
                }
            };

            email.getSubscribers = function () {
                return routes.requestGET(routes.urls.email.subscriber());
            };

            function getSubscriptionToken() {
                if (!_.isUndefined(storage.get(EMAIL_SUBSCRIPTION_TOKEN_NAME))) {
                    return (JSON.parse(storage.get(EMAIL_SUBSCRIPTION_TOKEN_NAME)) || []);
                }
                return [];
            }

            email.getSubscriptionByTeam = function (o) {
                return _.filter(getSubscriptionToken(), {
                    'team': o.team
                });
            };

            email.getEmailSubscriptionByTeam = function (id) {
                return _.head(email.getSubscriptionByTeam({
                    team: id
                })).email;
            };

            email.checkSubscription = function (sub) {
                let result = false;
                _.forEach(getSubscriptionToken(), function (s) {
                    if (_.isEqual(s.team, sub.team) && (_.isUndefined(sub.email) || _.isEqual(s.email, sub.email))) {
                        result = true;
                    }
                });
                return result;
            };

            email.removeSubscription = function (sub) {
                return routes.requestMethodParams('DELETE', routes.urls.email.subscriber(), {email: sub.email, team: sub.team}).then(function (res) {
                    storage.set(EMAIL_SUBSCRIPTION_TOKEN_NAME, JSON.stringify(_.pullAllWith(getSubscriptionToken(), [sub], _.isEqual)));
                    return res;
                });
            };

            return email;
        }]);

})();