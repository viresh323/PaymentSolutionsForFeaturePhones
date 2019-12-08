// app.service('$todoService', function($http) {
app.factory('PaymentService', function ($http, $location) {

    var baseUrl = 'http://localhost:3000/v1/ewallet';

    let currentUser = JSON.parse(localStorage.currentUser);

    return {
        requestOTP: function (mobileNumber, amount) {
            this.updateToken();
            var url = baseUrl + '/requestOtp/';
            return $http.post(url, {
                'mobileNumber': mobileNumber,
                'amount': amount
            });
        },
        receiveAmt: function (mobileNumber, amount, otp) {
            this.updateToken();
            var url = baseUrl + '/receiveAmt/';
            return $http.post(url, {
                'mobileNumber': mobileNumber,
                'amount': amount,
                'otp': otp
            });
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