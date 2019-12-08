app.controller("LoginCtrl", function ($location, $scope, $http, $rootScope) {

    // Called on page init.
	$scope.initPage = function () {
        localStorage.currentUser = null;
    }

    $scope.login = function () {
        $scope.dataLoading = true;
        $scope.invalidMsgShow = false;
        $http.post('/v1/auth/login', $scope.user).success(function (response) {
            localStorage.currentUser = JSON.stringify(response);
            $rootScope.currentUser = response;
            $scope.dataLoading = false;
            $location.url("/todo");
        }).error(function (error, status) {
            $rootScope.currentUser = null;
            $scope.dataLoading = false;
            if (status == 401) {
                $scope.invalidMsgShow = true;
            }
        });
    }

    $scope.initPage();
});