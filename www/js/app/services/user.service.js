(function () {
  "use strict";

  angular
    .module('starter')
    .factory('UserService', UserService);

  function UserService($q, $socket, $url, $http) {

    var login = function (data, rememberFlag) {
      var deferred = $q.defer();
      $socket.emit('req:login', data)
        .on('res:login', function (alldata) {
          console.log('res:login socket: ', alldata);
          if (alldata) {
            if (rememberFlag)
              localStorage.user = JSON.stringify(alldata);
            deferred.resolve(alldata);
          }
          else {
            localStorage.user = '';
            deferred.resolve(false);
          }
        });
      return deferred.promise;
    };

    var logout = function () {
      var deferred = $q.defer();
      localStorage.clear();
      deferred.resolve();
      return deferred.promise;
    };

    var register = function (data) {
      console.log('=====> register', data);
      var deferred = $q.defer();
      $socket.emit('req:register', data)
        .on('res:register', function (alldata) {
          console.log('res:register socket: ', alldata);
          if (alldata) {
            delete alldata.password;
            localStorage.user = JSON.stringify(alldata);
            deferred.resolve(alldata);
          }
          else {
            deferred.resolve(false);
          }
        });
      return deferred.promise;
    };

    var authenticate = function (data) {
      var deferred = $q.defer();
      if (localStorage.user) {
        var user = JSON.parse(localStorage.user);
        $socket.emit('req:login', {username: user.username, _id: user._id, token: user.token})
          .on('res:login', function (alldata) {
            console.log('res:login authentication socket: ', alldata);
            if (alldata) {
              deferred.resolve(alldata);
            }
            else {
              deferred.resolve(false);
            }
          });
      }
      else {
        deferred.resolve(false);
      }
      return deferred.promise;
    };

    var uploadImage = function (data) {
      console.log('uploadImage enter in fun : ', data);
      var deferred = $q.defer();
      if (data) {
        var fd = new FormData();
        fd.append('file', data);
        $http.post($url + '/upload', fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
        }).success(function (res) {
          console.log('uploadImage success', res);
          deferred.resolve(res);
        }).error(function (err) {
          console.log('err on upload: ', err);
          deferred.resolve(false);
        });
      }
      else {
        deferred.resolve(false);
      }
      return deferred.promise;
    };

    return {
      login: login,
      logout: logout,
      register: register,
      authenticate: authenticate,
      uploadImage: uploadImage
    };
  }

})();
