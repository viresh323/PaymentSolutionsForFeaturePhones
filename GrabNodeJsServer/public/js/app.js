var app = angular.module("PassportApp", ["ngRoute", "ngAnimate", "toastr"]);

app.config(function ($routeProvider) {
	$routeProvider
		.when('/login', {
			templateUrl: 'views/login.html',
			controller: 'LoginCtrl'
		})
		.when('/signup', {
			templateUrl: 'views/signup.html',
			controller: 'SignUpCtrl'
		})
		.when('/todo', {
			templateUrl: 'views/todo.html',
			controller: 'taskController'
		})
		.when('/payment', {
			templateUrl: 'views/payment.html',
			controller: 'paymentCrtl'
		})
		.otherwise({
			redirectTo: '/login'
		})
});

var checkLoggedin = function ($q, $timeout, $http, $location, $rootScope) {
	var deferred = $q.defer();

	$http.get('/loggedin').success(function (user) {
		$rootScope.errorMessage = null;
		//User is Authenticated
		if (user !== '0') {
			$rootScope.currentUser = user;
			deferred.resolve();
		} else { //User is not Authenticated
			$rootScope.errorMessage = 'You need to log in.';
			deferred.reject();
			$location.url('/login');
		}
	});
	return deferred.promise;
}