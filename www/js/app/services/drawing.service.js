(function () {
  "use strict";

  angular
    .module('starter')
    .factory('DrawingService', DrawingService);

  function DrawingService($q, $socket) {

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
        $socket.emit('req:all:scenes', {user_id: loggedin_user._id})
          .on('res:all:scenes', function (alldata) {
            $socket.removeListener('res:all:scenes');
            console.log('res:all:scens : data : ', alldata);
            completeData = alldata;
            deferred.resolve(alldata);
          });
      }
      else {
        console.log('get nothing==== >');
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
      $socket.emit('req:save:scene', sound_obj)
        .on('res:save:scene', function (alldata) {
          $socket.removeListener('res:save:scene');
          deferred.resolve(alldata);
        });
      return deferred.promise;
    };

    var swap = function (arr, project_id) {
    };

    var addProject = function (obj, defaultSettings) {
      var deferred = $q.defer();
      obj.user_id = loggedin_user._id;
      $socket.emit('req:project:create', obj)
        .on('res:project:create', function (alldata) {
          $socket.removeListener('res:project:create');
          console.log('res:project:create: ', alldata);
          if (defaultSettings) {
            localStorage.rbboardDefault = obj.project_id
          }
          deferred.resolve(alldata);
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

    return {
      get: getSounds,
      getInitialProject: getInitialProject,
      getProjectVideo: getProjectVideo,
      addProject: addProject,
      save: saveSound,
      delete: deleteSound,
      deleteAll: deleteAll,
      //play: playSound,
      concatenateFiles: concatenatefiles,
      swap: swap,
      ClearUserData: ClearUserData,
      loggedInUser: loggedInUser
    };
  }

})();
