app.controller('paymentCrtl', function ($scope, $route, PaymentService, toastr) {
	$scope.today = new Date();

	// Called on page init.
	$scope.initPage = function () {
	}

	$scope.requestOTP = function () {
		if ($scope.mobilenumber != null && $scope.amount != null) {
			PaymentService.requestOTP($scope.mobilenumber, $scope.amount).then(function successCallback(response) {
				if (response.data) {
					toastr.success(response.data.result, 'Transfer recorded successfully!');
					//$route.reload();
				} else {
					// @TODO: Handle the error properly instead of alert.
					toastr.warning(response.data.message, 'Save Unsuccessfully!');
				}
			}, function errorCallback(response) {
				// @TODO: Handle the error properly instead of alert.
				toastr.error(response.data.message || 'Error@Storing the task in DB', 'Error !!');
				$route.reload();
			});
		} else {
			toastr.warning('Please enter Mobile Number or ');
		}
	}

	$scope.receiveAmt = function () {
		if ($scope.mobilenumber != null && $scope.amount != null && $scope.otp != null) {
			PaymentService.receiveAmt($scope.mobilenumber, $scope.amount, $scope.otp).then(function successCallback(response) {
				if (response.data) {
					toastr.success(response.data.result, 'Amount received successfully!');
					$route.reload();
				} else {
					// @TODO: Handle the error properly instead of alert.
					toastr.warning(response.data.message, 'Transaction Unsuccessfully!');
				}
			}, function errorCallback(response) {
				// @TODO: Handle the error properly instead of alert.
				toastr.error(response.data.message || 'Error@Storing the task in DB', 'Error !!');
				$route.reload();
			});
		} else {
			toastr.warning('Please enter Mobile Number and OTP');
		}
	}

	$scope.initPage();
});