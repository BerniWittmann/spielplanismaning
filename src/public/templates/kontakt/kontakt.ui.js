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
                    version: function (config) {
                        return config.getVersion();
                    },
                    kontakt: function (config) {
                        return config.getKontakte();
                    },
                    env: function (config) {
                        return config.getEnv();
                    }
                }
            });

    }

    function KontaktController(version, kontakt, env, BUG_REPORT_EMAIL) {
        var vm = this;

        vm.loading = true;

        _.extend(vm, {
            version: version,
            showBuildStatus: _.isEqual(env, 'testing') || _.isEqual(env, 'development'),
            kontakte: kontakt,
            bugReportEmailHref: 'mailto:' + BUG_REPORT_EMAIL
        });
        if (_.isEqual(env, 'testing')) {
            vm.version += ' TESTUMGEBUNG';
        }
        vm.loading = false;
    }
})();