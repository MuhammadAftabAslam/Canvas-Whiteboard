(function () {
  "use strict";

  angular
    .module('starter')
    .controller('DashCtrl', [
      '$scope',
      '$ionicModal',
      'UserService',
      '$state',
      '$rootScope',
      DashCtrl
    ]);

  function DashCtrl($scope, $ionicModal, UserService, $state, $rootScope) {
    UserService.authenticate().then(function (auth) {
      if (!auth) {
        $state.go('login');
      } else {
        $rootScope.$emit('user:loggedin', auth);
      }
    })
  }

})();
