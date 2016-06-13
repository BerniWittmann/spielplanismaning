angular
	.module('spi.email', []).factory('email', ['$http', function ($http) {
		var email = {};

		email.send = function (email) {
			return $http.post('/email/', email).success(function (res) {
				return res.data;
			});
		};


		return email;
}]);