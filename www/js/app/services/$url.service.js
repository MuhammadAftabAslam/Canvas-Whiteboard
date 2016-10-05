(function () {
  "use strict";

  angular
    .module('starter')
    .factory('$url', $url);

  function $url() {
    //var url = 'http://localhost:91';
    //var url = 'http://192.168.0.41:91';
    var url = 'http://172.16.10.228:9090';
    //var url = 'http://172.16.11.202:9090';
    //var url = 'http://116.58.62.60:9090';
    return url;
  }

})();
