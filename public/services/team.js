angular
	.module('spi.team', ['spi.auth']).factory('team', ['$http', 'auth', function ($http, auth) {

			var team = {
				teams: []
			};

			team.getAll = function () {
				return $http.get('/teams').success(function (data) {
					angular.copy(data, team.teams);
					return data;
				});
			};

			team.create = function (team) {		
				return $http.post('/jugenden/' + team.jugend + '/gruppen/' + team.gruppe + '/teams', team).success(function (data) {
					return data;
				});
			};

			team.get = function (id) {
				return $http.get('/teams/' + id).then(function (res) {
					return res.data;
				});
			};
			
			team.getByGruppe = function (gruppenid, jugendid) {
				return $http.get('/jugenden/' + jugendid + '/gruppen/' + gruppenid + '/teams').then(function (res) {
					return res.data;
				})
			}

			team.delete = function (teamid) {
				return $http.delete('/teams/'+teamid).then(function (res) {
					return res;
				}) ;
			}
			
			team.resetErgebnisse = function () {
				return $http.put('/teams/resetErgebnisse').then(function (res) {
					return res;
				});
			}
			
			team.updateName = function (team, name) {
				team.name = name;
				return $http.put('/teams/' + team._id, team).then(function (res) {
					return res;
				});
			}

			return team;
}]);