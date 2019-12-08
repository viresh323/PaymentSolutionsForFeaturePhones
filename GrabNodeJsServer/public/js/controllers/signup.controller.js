app.controller("SignUpCtrl", function ($scope, $http, $rootScope, $location, toastr) {

	// Called on page init.
	$scope.initPage = function () {
        localStorage.currentUser = null;
	}

	$scope.signup = function () {
		// TODO: verify passwords are the same and notify user
		$scope.dataLoading = true;
		$http.post('/v1/auth/register', $scope.user).success(function (user) {
			localStorage.currentUser = JSON.stringify(user);
			$scope.dataLoading = false;
			$location.url("/todo");
		}).error(function (error, status) {
			if(error.errors && error.errors[0].field == "secretKey") {
				toastr.warning(error.errors[0].field + ' Length should be of 6 Char', 'Save Unsuccessfully!');
			}
			else if(error.errors && error.errors[0].field == "email") {
				toastr.warning('Please enter vaild email ID', 'Save Unsuccessfully!');
			}
			else if(error.errors && error.errors[0].field == "password") {
				toastr.warning('Password length should be more then 6 Char', 'Save Unsuccessfully!');
			}
			else if(error.errors && error.errors[0].field == "name") {
				toastr.warning('Name length should be more then 6 Char', 'Save Unsuccessfully!');
			}
			else if(error.errors && error.errors[0].field == "mobileNumber") {
				toastr.warning('Mobile Number length should be equal to 10 Char', 'Save Unsuccessfully!');
			} else {
				toastr.warning(error.message || 'Something went wrong', 'Save Unsuccessfully!');
			}
			$scope.dataLoading = false;
		});
	}

	$scope.initPage();
});