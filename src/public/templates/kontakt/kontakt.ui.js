(function () {
    'use strict';

    angular
        .module('spi.templates.kontakt.ui', [
            'ui.router', 'spi.config'
        ])
        .config(states)
        .controller('KontaktController', KontaktController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.kontakt', {
                url: '/kontakt',
                templateUrl: 'templates/kontakt/kontakt.html',
                controller: KontaktController,
                controllerAs: 'vm',
                resolve: {
                    versionPromise: function (config) {
                        return config.getVersion();
                    },
                    kontaktPromise: function (config) {
                        return config.getKontakte();
                    },
                    envPromise: function (config) {
                        return config.getEnv();
                    }
                }
            });

    }

    function KontaktController(versionPromise, kontaktPromise, envPromise, BUG_REPORT_EMAIL) {
        var vm = this;

        vm.loading = true;

        _.extend(vm, {
            version: versionPromise.data,
            showBuildStatus: _.isEqual(envPromise.data, 'testing') || _.isEqual(envPromise.data, 'development'),
            kontakte: kontaktPromise.data,
            bugReportEmailHref: 'mailto:' + BUG_REPORT_EMAIL
        });
        if (_.isEqual(envPromise.data, 'testing')) {
            vm.version += ' TESTUMGEBUNG';
        }
        vm.loading = false;
    }
})();