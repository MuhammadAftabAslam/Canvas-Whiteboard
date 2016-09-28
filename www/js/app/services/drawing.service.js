(function () {
  "use strict";

  angular
    .module('starter')
    .factory('DrawingService', DrawingService);

  function DrawingService($q, $socket,$cordovaFile) {

    var loggedin_user = '';
    localStorage.user ? loggedin_user = JSON.parse(localStorage.user) : loggedin_user = '';
    var completeData = [];

    var deleteSound = function (scene_id) {
      console.log("calling deleteSound service ", scene_id);
      var deferred = $q.defer();
      $socket.emit('req:hide:scene', {_id: scene_id})
        .on('res:hide:scene', function (alldata) {
          $socket.removeListener('res:hide:scene');
          deferred.resolve(alldata);
        });
      return deferred.promise;
    };

    /*
    var deleteFile = function (file) {
      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
        dir.getFile(file, {create: false}, function (fileEntry) {
          fileEntry.remove(function (file) {
            alert("fichier supprimer");
          }, function () {
            alert("erreur suppression " + error.code);
          }, function () {
            alert("fichier n'existe pas");
          });
        });


      });

    }
    deleteFile("user.json");
    deleteFile("data.json");
    localStorage.clear();
    */

    var deleteAll = function (project_id) {
      var deferred = $q.defer();
      if (project_id) {
        $socket.emit('req:project:hide', {_id: project_id})
          .on('res:project:hide', function (alldata) {
            $socket.removeListener('req:project:hide');
            console.log("all delete ", alldata);
            deferred.resolve(true);
          });
      }
      else {
        deferred.resolve(false);
      }
      return deferred.promise;
    };

    var getSounds = function () {
      localStorage.user ? loggedin_user = JSON.parse(localStorage.user) : loggedin_user = '';
      var deferred = $q.defer();
      if (loggedin_user && loggedin_user._id) {
        getFileData().then(function (alldata) {
          console.log('res:getFileData: ', alldata);
          if (alldata.length) {
            var all_project = [];
            all_project = JSON.parse(alldata);
            var user_projects = [];
            for (var i = 0; i < all_project.length; i++) {
              if (all_project[i].user_id == loggedin_user._id) {
                user_projects.push(all_project[i]);
              }
              if (all_project.length - 1 == i) {
                completeData = user_projects;
                deferred.resolve(user_projects);
              }
            }
          }
          else {
            deferred.resolve([]);
          }
        });
      }
      else {
        console.log('user not logged in');
        deferred.resolve([]);
      }
      return deferred.promise;
    };

    var getInitialProject = function (project_id) {

      console.log('getInitialProject : ');
      var deferred = $q.defer();
      var sounds = [];
      getSounds().then(function (allProjects) {
        console.log('after getting projects : ', allProjects);
        if (allProjects.length) {
          sounds = completeData = allProjects;
          var project = {};
          var default_project = project_id || localStorage.rbboardDefault;
          project_id ? localStorage.rbboardDefault = project_id : localStorage.rbboardDefault = '';
          for (var i = 0; i < sounds.length; i++) {
            if (sounds[i]._id == default_project) {
              project = sounds[i];
              deferred.resolve(project);
            }
          }
          if (Object.keys(project).length < 1) {
            project = sounds[0];
            deferred.resolve(project);
          }
        }
        else {
          deferred.resolve(false);
        }
      });
      return deferred.promise;
    };

    var getProjectVideo = function (project_id) {
      console.log('getProjectVideo');
      var deferred = $q.defer();
      getFileData().then(function (alldata) {
        if (alldata) {
          var projectAlreadyExist = JSON.parse(alldata);
          for (var i = 0; i < projectAlreadyExist.length; i++) {
            if (projectAlreadyExist[i].project_id == project_id) {
              projectAlreadyExist[i].scenes.push(sound_obj);
            }

            if (projectAlreadyExist.length - 1 == i) {
              setFileData(projectAlreadyExist).then(function (respondObj) {
                deferred.resolve(sound_obj);
              })
            }
          }
        }
      });
      return deferred.promise;
    };

    var getVideo = function (project_id) {
      var deferred = $q.defer();
      $socket.emit('req:project:video', {project_id: project_id})
        .on('res:project:video', function (alldata) {
          $socket.removeListener('res:project:video');
          deferred.resolve(alldata);
        });
      return deferred.promise;
    };

    var saveSound = function (sound_obj, project_id) {
      var deferred = $q.defer();
      sound_obj.project_id = project_id;
      sound_obj.user_id = loggedin_user._id;

      console.log('sound_obj : ', sound_obj);
      getFileData().then(function (alldata) {
        if (alldata) {
          var projectAlreadyExist = JSON.parse(alldata);
          for (var i = 0; i < projectAlreadyExist.length; i++) {
            if (projectAlreadyExist[i].project_id == project_id) {
              projectAlreadyExist[i].scenes.push(sound_obj);
            }

            if (projectAlreadyExist.length - 1 == i) {
              setFileData(projectAlreadyExist).then(function (respondObj) {
                deferred.resolve(sound_obj);
              })
            }
          }
        }
      });
      return deferred.promise;
    };

    var swap = function (arr, project_id) {
    };

    var addProject = function (obj, defaultSettings) {
      var deferred = $q.defer();
      obj.user_id = loggedin_user._id;
      obj._id = (new Date()).getTime();
      obj.project_hide = false;
      obj.project_id = obj._id;
      obj.scenes = [];
      console.log('addproject : obj', obj);
      if (defaultSettings) {
        localStorage.rbboardDefault = obj.project_id
      }
      getFileData().then(function (alldata) {
        if (alldata) {
          var projectAlreadyExist = JSON.parse(alldata);
          projectAlreadyExist.push(obj);
          setFileData(projectAlreadyExist).then(function (respondObj) {
            if (respondObj) {
              deferred.resolve(obj);
            }
            else {
              console.log('dont know the issue if');
            }
          })
        }
        else {
          var firstProject = [];
          firstProject.push(obj);
          setFileData(firstProject).then(function (respondObj) {
            if (respondObj) {
              deferred.resolve(obj);
            }
            else {
              console.log('dont know the issue');
            }
          });
        }

      });
      return deferred.promise;
    };

    var concatenatefiles = function (files) {
      var deferred = $q.defer();
      $socket.emit('req:audio:concatenate', files)
        .on('res:audio:concatenate', function (alldata) {
          console.log('res:audio:concatenate: ', alldata);
          deferred.resolve(alldata);
        });
      return deferred.promise;
    };

    var ClearUserData = function () {
      var deferred = $q.defer();
      loggedin_user = '';
      completeData = [];
      deferred.resolve();
      return deferred.promise;
    };

    var loggedInUser = function () {
      return loggedin_user || JSON.parse(localStorage.user);
    };


    var getFileData = function () {
      var deferred = $q.defer();
      var sounds = [];
      checkFile().then(function (fileRes) {
        console.log('drawing checkFile : ', fileRes);
        fileRes && $cordovaFile.readAsText(cordova.file.externalDataDirectory, "data.json")
          .then(function (success) {
            console.log("drawing Successful in reading the file initially:");
            deferred.resolve(success);
          }, function (error) {
            deferred.resolve(false);
            console.log("drawing error reading the file", error)
          });
      })
      return deferred.promise;
    };

    var checkFile = function () {
      var deferred = $q.defer();
      if(window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        $cordovaFile.checkFile(cordova.file.externalDataDirectory, "data.json")
          .then(function (success) {
            console.log('drawing check file : success: ', success);
            deferred.resolve(true);
          }, function (error) {
            console.log('drawing check file : err: ', error);
            $cordovaFile.createFile(cordova.file.externalDataDirectory, "data.json", true)
              .then(function (success) {
                console.log('drawing create file : success: ', success);
                deferred.resolve(true);
              }, function (error) {
                console.log('drawing create file : err: ', error);
                deferred.resolve(false);
              });
          });
      }
      return deferred.promise;
    }

    var setFileData = function (data) {
      var deferred = $q.defer();
      var data = JSON.stringify(data);
      $cordovaFile.writeFile(cordova.file.externalDataDirectory, 'data.json', data, true)
        .then(function (success) {
          console.log("drawing success the file has been created")
          deferred.resolve(true);
        }, function (error) {
          console.log("drawing error" + JSON.stringify(error))
          deferred.resolve(error);
        });
      return deferred.promise;
    };

    var uploadCompleteProject = function (project_id) {
      var deferred = $q.defer();
      var project_obj = "";
      getFileData().then(function (alldata) {
        if (alldata) {
          var projectAlreadyExist = JSON.parse(alldata);
          for (var i = 0; i < projectAlreadyExist.length; i++) {
            if (projectAlreadyExist[i].project_id == project_id) {
              console.log('project found in data : ');
              project_obj = projectAlreadyExist[i];
            }

            if (projectAlreadyExist.length - 1 == i && project_obj) {
              console.log('project_obj : ', project_obj);
              if (project_obj && project_obj.scenes && project_obj.scenes.length) {
                readSoundFiles(project_obj).then(function (response) {
                  console.log("res all read file : ", response);
                  var promises = [];
                  angular.forEach(project_obj.scenes, function (value) {
                    promises.push(uploadSceneToServer(value));
                  });
                  $q.all(promises).then(function () {
                    console.log('all promises after server');
                    deferred.resolve(true);
                  });

                });
              }
              else {
                deferred.resolve(false);
              }
            }
          }
        }
      });
      return deferred.promise;
    };

    var readSoundFiles = function (project_obj) {
      var defer = $q.defer();
      var promises = [];
      angular.forEach(project_obj.scenes, function (value) {
        promises.push(readFile(value));
      });
      $q.all(promises).then(function () {
        console.log('all promises');
        defer.resolve(project_obj);
      });
      return defer.promise;
    }

    var readFile = function (obj) {
      var defer = $q.defer();
      window.resolveLocalFileSystemURL(obj.audio_data, function (fileEntry) {
        fileEntry.file(function (file) {
          console.log('file : ', file);
          var reader = new FileReader();
          reader.onloadend = function (e) {
            obj.audio_data = this.result;
            //console.log('content : ', this.result);
            defer.resolve(obj);
          };
          reader.readAsDataURL(file);

        }, function (e) {
          console.log('error on read file', e);
        });
      })
      return defer.promise;
    }

    var uploadSceneToServer = function (obj) {
      var deferred = $q.defer();
      console.log('upload to server : ', obj);
      $socket.emit('req:save:scene', obj)
        .on('res:save:scene', function (alldata) {
          $socket.removeListener('res:save:scene');
          console.log('res:upload:project: ', alldata);
          deferred.resolve(alldata);
        });
      return deferred.promise;
    };


    return {
      get: getSounds,
      getInitialProject: getInitialProject,
      getProjectVideo: getProjectVideo,
      addProject: addProject,
      save: saveSound,
      delete: deleteSound,
      deleteAll: deleteAll,
      getVideo: getVideo,
      //play: playSound,
      concatenateFiles: concatenatefiles,
      swap: swap,
      ClearUserData: ClearUserData,
      loggedInUser: loggedInUser,
      uploadCompleteProject : uploadCompleteProject
    };
  }

})();
