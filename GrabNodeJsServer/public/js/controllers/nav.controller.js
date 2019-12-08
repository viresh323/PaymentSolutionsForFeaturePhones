app.controller("NavCtrl", function ($rootScope, $scope, $http, $location) {

	// Called on page init.
	$scope.initPage = function () {
		$scope.currentUser = JSON.parse(localStorage.currentUser);
	}

	$scope.logout = function () {
		$http.post("/logout").success(function () {
			$rootScope.currentUser = null;
			localStorage.currentUser = null;
			$location.url("/login");
		});
	}

	$scope.initPage();
});