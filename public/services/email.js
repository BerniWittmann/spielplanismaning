angular
	.module('spi.email', []).factory('email', ['$http', function ($http) {
		var email = {};

		email.send = function (email) {
			return $http.post('/email/', email).success(function (res) {
				return res.data;
			});
		};

		email.addSubscriber = function (abonnent) {
			return $http.post('/email/subscriber', abonnent).error(function (err) {
				return err;
			}).success(function (res) {
				console.log(res);
				return res.data;
			});
		}


		return email;
}]);