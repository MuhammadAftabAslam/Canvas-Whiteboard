(function () {
  "use strict";

  angular
    .module('starter')
    .factory('$weburl', $weburl);

  function $weburl() {
    //var url = 'http://localhost:8100/#/video/';
    //var url = 'http://192.168.0.41:8100/#/video/';
    //var url = 'http://172.16.10.228:8100/#/video/';
    //var url = 'http://localhost:8100/#/video/';
    //var url = 'http://172.16.11.202:8100/#/video/';
    var url = 'http://172.16.10.228/#/video/';
    return url;
  }

})();
