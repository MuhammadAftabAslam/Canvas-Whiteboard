(function () {
  "use strict";

  angular
    .module('starter')
    .factory('UserService', UserService);

  function UserService($q, $socket, $url, $http, $cordovaFile) {

    var login = function (data, rememberFlag) {
      var deferred = $q.defer();
      getFileData().then(function (alldata) {
        console.log('res:getFileData: ', alldata);
        if (alldata.length) {
          console.log('res:alldata.len: ', alldata.length);
          findUser(alldata, data.email).then(function (user) {
            console.log('res find user: ', user);
            if (user) {
              localStorage.user = JSON.stringify(user);
              deferred.resolve(user);
            }
            else {
              var temArr = [];
              temArr = JSON.parse(alldata);
              var tmpUser = {
                email: data.email,
                _id: (new Date()).getTime()
              };
              temArr.push(tmpUser);
              localStorage.user = JSON.stringify(tmpUser);
              setFileData(temArr).then(function () {
                deferred.resolve(tmpUser);
              })
            }
          });

        }
        else {
          var tempArr = [];
          var tmp = {
            email: data.email,
            _id: (new Date()).getTime()
          };
          tempArr.push(tmp);
          localStorage.user = JSON.stringify(tmp);
          setFileData(tempArr).then(function () {
            deferred.resolve(tmp);
          })

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

    var findUser = function (alldata, email) {
      var temArr = [];
      temArr = JSON.parse(alldata);
      console.log('in findUser : ', temArr, email);
      var deferred = $q.defer();
      for (var i = 0; i < temArr.length; i++) {
        console.log('i',temArr[i].email, email);
        if (temArr[i].email == email) {
          deferred.resolve(temArr[i]);
        }
        if (i == temArr.length - 1) {
          deferred.resolve(false);
        }
      }
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
        console.log('res:login authentication socket: ', user);
        if (user && user._id && user.email) {
          deferred.resolve(user);
        }
        else {
          deferred.resolve(false);
        }
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

    var getFileData = function () {
      var deferred = $q.defer();
      var sounds = [];
      checkFile().then(function (fileRes) {
        console.log('checkFile : ', fileRes);
        fileRes && $cordovaFile.readAsText(cordova.file.externalDataDirectory, "user.json")
          .then(function (success) {
            console.log("Successful in reading the file initially:", success);
            deferred.resolve(success);
          }, function (error) {
            deferred.resolve(false);
            console.log("error reading the file", error)
          });
      })
      return deferred.promise;
    };

    var checkFile = function () {
      var deferred = $q.defer();
      $cordovaFile.checkFile(cordova.file.externalDataDirectory, "user.json")
        .then(function (success) {
          console.log('check file : success: ', success);
          deferred.resolve(true);
        }, function (error) {
          console.log('check file : err: ', error);
          $cordovaFile.createFile(cordova.file.externalDataDirectory, "user.json", true)
            .then(function (success) {
              console.log('create file : success: ', success);
              deferred.resolve(true);
            }, function (error) {
              console.log('create file : err: ', error);
              deferred.resolve(false);
            });
        });
      return deferred.promise;
    }

    var setFileData = function (data) {
      var deferred = $q.defer();
      var data = JSON.stringify(data);
      $cordovaFile.writeFile(cordova.file.externalDataDirectory, 'user.json', data, true)
        .then(function (success) {
          console.log("success the file has been created")
          deferred.resolve(true);
        }, function (error) {
          console.log("error" + JSON.stringify(error))
          deferred.resolve(error);
        });
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
