(function () {
    'use strict';

    angular
        .module('spi.ansprechpartner', ['spi.routes'])
        .factory('ansprechpartner', ['routes', function (routes) {
            var ansprechpartner = {};

            ansprechpartner.getAll = function () {
                return routes.request({method: routes.methods.GET, url: routes.urls.ansprechpartner.base()});
            };

            ansprechpartner.get = function (id) {
                return routes.request({method: routes.methods.GET, url: routes.urls.ansprechpartner.base(), params: {id: id}});
            };

            ansprechpartner.create = function (data) {
                return routes.request({method: routes.methods.POST, url: routes.urls.ansprechpartner.base(), data: data});
            };

            ansprechpartner.update = function (id, data) {
                return routes.request({method: routes.methods.PUT, url: routes.urls.ansprechpartner.base(), params: {id: id}, data: data});
            };

            ansprechpartner.delete = function (id) {
                return routes.request({method: routes.methods.DELETE, url: routes.urls.ansprechpartner.base(), params: {id: id}});
            };

            return ansprechpartner;
        }]);

})();