(function () {
  "use strict";

  angular
    .module('starter')
    .factory('$url', $url);

  function $url() {
    //var url = 'http://localhost:8080';
    //var url = 'http://192.168.0.41:8080';
    var url = 'http://172.16.10.228:8080';
    //var url = 'http://172.16.11.202:8080';
    return url;
  }

})();
