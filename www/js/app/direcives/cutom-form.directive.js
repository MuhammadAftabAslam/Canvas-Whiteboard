(function () {
  "use strict";

  angular
    .module('starter')
    .directive('customForm', [
      '$timeout',
      customForm
    ]);

  function customForm($timeout) {

    return {
      restrict: "AE",
      scope: false,
      link: function (scope, element) {
        $timeout(function () {
          window.initCustomForms();
        });
      }
    }

  }

})();
