// app.service('$todoService', function($http) {
app.factory('TodoService', function ($http, $location) {

    var baseUrl = 'http://localhost:3000/v1/ewallet';

    let currentUser = JSON.parse(localStorage.currentUser);

    return {
        getTransactions: function () {
            this.updateToken();
            var url = baseUrl + '/transactions';
            return $http.get(url);
        },
        initiateTransfer: function (transferObj) {
            this.updateToken();
            return $http.post(baseUrl + '/transfer', transferObj);
        },
        getBalance: function () {
            this.updateToken();
            var url = baseUrl + '/balance';
            return $http.get(url);
        },
        updateToken: function() {
            currentUser = JSON.parse(localStorage.currentUser);
            if (currentUser == null) {
                $location.url("/login");
            } else {
                const authToken = currentUser.token.accessToken;
                $http.defaults.headers.common.Authorization = 'Bearer ' + authToken;
            }
        }
    };
});