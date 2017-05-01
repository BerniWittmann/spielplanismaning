(function () {
    'use strict';

    angular
        .module('spi.templates.imagefeed.ui', [
            'ui.router'
        ])
        .config(states)
        .controller('ImageFeedController', ImageFeedController);

    function states($stateProvider) {
        $stateProvider
            .state('spi.imagefeed', {
                url: '/imagefeed',
                templateUrl: 'templates/imagefeed/imagefeed.html',
                controller: ImageFeedController,
                controllerAs: 'vm',
                data: {
                    requiredRoles: []
                }
            });

    }

    function ImageFeedController() {
        const vm = this;

        vm.loading = true;

        const feed = new Instafeed({
            get: 'tagged',
            tagName: 'isibeach',
            accessToken: '4674355321.ba4c844.5e9a6db1685549dc8c6fa850bccfc043',
            sortBy: 'most-recent',
            target: 'feed-div',
            template: '<a href="{{link}}" class="insta-card">' +
            '<div class="body">' +
            '<img src="{{image}}" alt="" />' +
            '</div>' +
            '<div class="foot">' +
            '<div class="box">' +
            '<p>{{caption}}</p>' +
            '</div>' +
            '</div>' +
            '</a>'
        });
        feed.run();

        vm.loading = false;
    }
})();