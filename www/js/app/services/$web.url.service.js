(function () {
  "use strict";

  angular
    .module('starter')
    .factory('$weburl', $weburl);

  function $weburl() {
    //var url = 'http://localhost:9100/#/video/';
    //var url = 'http://192.168.0.41:9100/#/video/';
    //var url = 'http://172.16.10.228:9100/#/video/';
    //var url = 'http://localhost:9100/#/video/';
    //var url = 'http://172.16.11.202:9100/#/video/';
    //var url = 'http://172.16.10.228:9100/#/video/';
    var url = 'http://116.58.62.60:8080/#/video/';
    return url;
  }

})();
