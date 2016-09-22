(function () {
  "use strict";

  angular
    .module('starter')
    .controller('NavCtrl', [
      '$scope',
      '$ionicSideMenuDelegate',
      NavCtrl
    ]);

  function NavCtrl($scope, $ionicSideMenuDelegate) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  }

})();
