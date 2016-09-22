(function () {
  "use strict";

  angular
    .module('starter')
    .directive('customFunctions', [
      customFunctions
    ]);

  function customFunctions() {

    return {
      restrict: "AE",
      scope: false,
      link: function (scope, element) {
        window.initMobileNav();
        window.initCustomHover();
        $('input, textarea').placeholder();
      }
    }

  }

})();
