(function () {
  "use strict";

  angular
    .module('starter')
    .controller('LoginCtrl', [
      '$scope',
      'UserService',
      '$ionicPopup',
      '$state',
      '$rootScope',
      LoginCtrl
    ]);

  function LoginCtrl($scope, UserService, $ionicPopup, $state, $rootScope) {

    $scope.data = {};

    $scope.login = function () {
      UserService
        .login(
          {
            email: $scope.data.email,
            password: $scope.data.password
          }, $scope.data.remember)
        .then(function (data) {
          if (data) {
            $rootScope.$emit('user:loggedin', data);
            $scope.data = {};
            $state.go('tab.dash');
          } else {
            var alertPopup = $ionicPopup.alert({
              title: 'Login failed!',
              template: 'Please check your credentials!'
            });
          }
        });
    };

    $scope
      .register = function () {
      UserService
        .register({
          username: $scope.data.usernamereg,
          email: $scope.data.emailreg,
          password: $scope.data.passwordreg
        })
        .then(function (data) {
          if (data) {
            $state.go('tab.dash');
            $scope.data = {};
          } else {
            var alertPopup = $ionicPopup.alert({
              title: 'Registration failed!',
              template: 'Email already exist!'
            });
          }
        });
    }

  }

})();
