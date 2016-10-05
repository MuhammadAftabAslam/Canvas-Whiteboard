(function () {
  "use strict";

  angular
    .module('starter')
    .directive('customFunctions', ['$rootScope',
      customFunctions
    ]);

  function customFunctions($rootScope) {

    return {
      restrict: "AE",
      scope: false,
      link: function (scope, element) {
        console.log('custom function directive call');
        window.initMobileNav();
        window.initCustomHover();
        $('input, textarea').placeholder();
      }
    }

  }

})();
