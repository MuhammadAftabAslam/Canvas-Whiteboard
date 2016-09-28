(function () {
  "use strict";

  angular
    .module('starter')
    .factory('Sounds', Sounds);

  function Sounds($q) {

    var deleteSound = function (scene_id, project_id) {
      console.log("calling deleteSound service ");
      var deferred = $q.defer();
      getSounds().then(function (sounds) {
        for (var j = 0; j < sounds.length; j++) {
          if (sounds[j].project_id === project_id) {
            for (var i = 0; i < sounds[j].scenes.length; i++) {
              if (sounds[j].scenes[i].id === scene_id) {
                sounds[j].scenes.splice(i, 1);
              }
            }
          }
        }
        localStorage.rbboard = JSON.stringify(sounds);
        deferred.resolve();
      });
      return deferred.promise;
    };

    var deleteAll = function () {
      localStorage.clear();
      var deferred = $q.defer();
      deferred.resolve();
      return deferred.promise;
    };

    var getFileData = function () {
      var deferred = $q.defer();
      var sounds = [];
      $cordovaFile.readAsText('main.json')
        .then(function (success) {
          console.log("Successful in reading the file initially:" + JSON.parse(success));
          deferred.resolve(JSON.parse(success));
        }, function (error) {
          deferred.resolve(false);
          console.log("error reading the file" + JSON.stringify(error))
        });
      return deferred.promise;
    };

    var setFileData = function (data) {
      var deferred = $q.defer();
      var data = JSON.stringify(data);
      $cordovaFile.writeFile(cordova.file.dataDirectory,'main.json', JSON.stringify(data), true)
        .then(function (success) {
          console.log("success the file has been created")
          deferred.resolve(true);
        }, function (error) {
          console.log("error" + JSON.stringify(error))
          deferred.resolve(error);
        });
      return deferred.promise;
    };

    var getInitialProject = function (project_id) {
      var deferred = $q.defer();
      var sounds = [];
      if (localStorage.rbboard) {
        sounds = JSON.parse(localStorage.rbboard);
        var project = {};
        var default_project = localStorage.rbboardDefault || project_id;
        for (var i = 0; i < sounds.length; i++) {
          if (sounds[i].project_id == default_project) {
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
      return deferred.promise;
    };


    /*var playSound = function (scene_id, project_id) {
     getSounds().then(function (sounds) {
     var sound = sounds[scene_id];

     /*
     Ok, so on Android, we just work.
     On iOS, we need to rewrite to ../Library/NoCloud/FILE'
     */
    /*var mediaUrl = sound.file;
     if (device.platform.indexOf("iOS") >= 0) {
     mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
     }
     var media = new Media(mediaUrl, function (e) {
     media.release();
     }, function (err) {
     console.log("media err", err);
     });
     media.play();
     });
     }*/

    var saveSound = function (sound_obj, project_id) {
      console.log("calling saveSound");
      var deferred = $q.defer();
      getSounds().then(function (sounds) {
        var flag = false;
        for (var j = 0; j < sounds.length; j++) {
          if (sounds[j].project_id === project_id) {
            if (sounds[j].scenes) {
              for (var i = 0; i < sounds[j].scenes.length; i++) {
                if (sounds[j].scenes[i].id === sound_obj.id) {
                  sounds[j].scenes[i] = sound_obj;
                  flag = true;
                }
              }
              if (!flag) {
                //sounds[j].scenes;
                sounds[j].scenes.push(sound_obj);
              }
            }
            else {
              sounds[j].scenes = [];
              sounds[j].scenes.push(sound_obj);
            }
          }
        }
        localStorage.rbboard = JSON.stringify(sounds);
        deferred.resolve();
      });
      return deferred.promise;
    };

    var swap = function (arr, project_id) {
      console.log("calling swap services");
      var deferred = $q.defer();
      getSounds().then(function (sounds) {
        for (var j = 0; j < sounds.length; j++) {
          if (sounds[j].project_id === project_id) {
            sounds[j].scenes = arr;
          }
        }
        localStorage.rbboard = JSON.stringify(sounds);
        deferred.resolve();
      });

      return deferred.promise;
    };

    var addProject = function (obj, defaultSettings) {
      if (defaultSettings) {
        localStorage.rbboardDefault = obj.project_id
      }
      var deferred = $q.defer();
      getSounds().then(function (sounds) {
        sounds.push(obj);
        localStorage.rbboard = JSON.stringify(sounds);
        deferred.resolve();
      });
      return deferred.promise;
    };

    return {
      get: getSounds,
      getInitialProject: getInitialProject,
      addProject: addProject,
      save: saveSound,
      delete: deleteSound,
      deleteAll: deleteAll,
      //play: playSound,
      swap: swap
    };

  }

})();
