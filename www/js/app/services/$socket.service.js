(function () {
  "use strict";

  angular
    .module('starter')
    .factory('$socket', [
      '$url',
      $socket
    ]);

  function $socket($url) {
    var socket = io.connect($url);
    console.log('socket connection : ',socket);
    return socket;
  }

})();
