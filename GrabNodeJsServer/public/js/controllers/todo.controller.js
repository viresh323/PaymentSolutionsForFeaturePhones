app.controller('taskController', function ($scope, $route, TodoService, toastr) {
	$scope.today = new Date();

	// Called on page init.
	$scope.initPage = function () {
		$scope.getTransactions();
		$scope.getBalance();
	}

	$scope.newTask = null;
	$scope.newTaskDate = null;
	$scope.newTaskCategory = $scope.categories;
	$scope.taskItem = [];
	$scope.transfer = function () {
		if ($scope.purpose != null && $scope.accountNumber != '' && $scope.secretKey != '' && $scope.secretKey != null && $scope.amount != null) {
			$scope.transfer = {};
			$scope.transfer.purpose = $scope.purpose;
			$scope.transfer.destinationAccountNumber = $scope.accountNumber;
			$scope.transfer.amount = $scope.amount;
			$scope.transfer.secretKey = $scope.secretKey;

			TodoService.initiateTransfer($scope.transfer).then(function successCallback(response) {
				if (response.data) {
					toastr.success(response.data.result, 'Transfer recorded successfully!');
					$route.reload();
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
			toastr.warning('Please enter purpose, amount and destination account');
		}
	}

	$scope.getTransactions = function () {
		TodoService.getTransactions().then(function successCallback(response) {
			if (response.data && response.data.length) {
				const intermediateTransactionList = [];
				for (let i = 0; i < response.data.length; i++) {
					if (response.data[i].purpose != undefined || response.data[i].destinationAccountNumber != undefined) {
						intermediateTransactionList.push(response.data[i]);
					}
				}
				$scope.taskItem = intermediateTransactionList;
			}
		}, function errorCallback(response) {
			toastr.error(response.data.message || 'Error@Fetching existing tasks in DB', 'Error !!');
		});
	}

	$scope.getBalance = function () {
		TodoService.getBalance().then(function successCallback(response) {
			$scope.balances = [];
			$scope.balances.push({
				'balance': response.data.balance
			});
		}, function errorCallback(response) {
			toastr.error(response.data.message || 'Error@Fetching existing tasks in DB', 'Error !!');
		});
	}

	$scope.initPage();
});