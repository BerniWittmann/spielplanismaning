angular
	.module('spi.gruppe', ['spi.auth']).factory('gruppe', ['$http', 'auth', function ($http, auth) {

			var gruppe = {
				gruppen: []
			};

			gruppe.getAll = function () {
				return $http.get('/gruppen').success(function (data) {
					return data;
				});
			};

			gruppe.create = function (jugendId, newgruppe) {
				return $http.post('/jugenden/'+jugendId+'/gruppen', newgruppe).success(function (data) {
					return data;
				});
			};
			
			gruppe.get = function (id) {
				return $http.get('/gruppen/' + id).then(function (res) {
					return res.data;
				});
			};
			
			gruppe.getByJugend = function (jugendid) {
				return $http.get('/jugenden/'+jugendid + '/gruppen').then(function (res) {
					return res.data;
				});
			}
			
			gruppe.delete = function (id) {
				return $http.delete('/gruppen/'+id).then(function (res) {
					return res;
				})
			}


			return gruppe;
}]);