(function () {
  "use strict";

  angular
    .module('starter')
    .controller('VideoCtrl', [
      '$scope',
      '$stateParams',
      'DrawingService',
      '$state',
      '$rootScope',
      '$serverurl',
      VideoCtrl
    ]);

  function VideoCtrl($scope, $stateParams, DrawingService, $state, $rootScope, $serverurl) {
    var audio = document.getElementById('videoplayer');
    var source = document.getElementById('mp3Source');
    var drawingElement = new RecordableDrawing("videocanvas");
    var c = document.getElementById("videocanvas");
    c.width = $(window).innerWidth(); //options.width;
    c.height = $(window).innerHeight();
    if ($stateParams.key) {


      var ctx = c.getContext("2d");


      var drawingGenerator = function (arr, cb) {
        var playRecording = function () {
          drawingElement.playRecording(function () {
            $scope.playbackInterruptCommand = "";
          }, function () {

            console.log('drawing playback complete', indexofRunningRecording);
            if (indexofRunningRecording < arr.length - 1) {
              indexofRunningRecording = indexofRunningRecording + 1;
              playbackLogic(arr[indexofRunningRecording]);
            }
            else {
              cb();
            }
          }, function () {
            console.log('drawing playback paused');
          }, function () {
            return $scope.playbackInterruptCommand;
          });
        };

        var playbackLogic = function (abc) {
          var test = [];
          test.push(abc);
          var result = deserializeDrawing(JSON.stringify(test));
          if (result == null)
            result = "Error : Unknown error in deserializing the data";
          if (result instanceof Array == false) {
            return;
          } else {
            drawingElement.recordings = result;
            //set drawing property of each recording
            for (var i = 0; i < result.length; i++) {
              result[i].drawing = drawingElement;
            }

            $('.video-holder').removeClass('play');
            playRecording();
            $('.video-holder').addClass('play');
          }
        };
        var indexofRunningRecording = 0;

        audio.play();
        playbackLogic(arr[0]);

      };

      var drawingConcatenator = function (arr, audioDuration, cb) {
        console.log('arr : ', arr, audioDuration);
        var timer = 0;
        var concatenatedData = [];
        var totalscenes = 0;
        for (var i = 0; i < arr.length - 1; i++) {
          totalscenes = totalscenes + arr[i].actionsets.length
        }

        console.log('totalscenes : ', totalscenes, audioDuration);
        for (var i = 0; i < arr.length; i++) {
          //if (arr[i].actionsets.length) {
          for (var j = 0; j < arr[i].actionsets.length; j++) {
            if (i > 0) {
              arr[i].actionsets[j].interval = arr[i].actionsets[j].interval + timer;
              //timer = arr[i].actionsets[j].interval;
              concatenatedData.push(arr[i].actionsets[j]);
            }
            else {
              concatenatedData.push(arr[i].actionsets[j]);
            }
            if (j == arr[i].actionsets.length - 1) {
              timer = arr[i].actionsets[j].interval;
              console.log('timer :', timer);
            }
            // }
          }
        }
        var diff = audioDuration / totalscenes;
        console.log('totalscenes : timer', audioDuration - timer, diff, concatenatedData);
        for (var i = 0; i < concatenatedData.length; i++) {
          console.log('b4 : ', i, concatenatedData[i].interval);
          concatenatedData[i].interval = concatenatedData[i].interval + diff;
          console.log('after : ', concatenatedData[i].interval)
        }
        cb({actionsets: concatenatedData});
      };


      var playRecording = function () {
        drawingElement.playRecording(function () {
          $scope.playbackInterruptCommand = "";
        }, function () {

          console.log('drawing playback complete');

        }, function () {
          console.log('drawing playback paused');
        }, function () {
          return $scope.playbackInterruptCommand;
        });
      };

      DrawingService.getVideo($stateParams.key).then(function (res) {
        console.log('project video : ', res);
        if (res) {
          console.log('res.drawing_data : ', res.drawing_data);
          source.src = $serverurl + 'uploads/' + res.audio_data;//'http://localhost:8080/' + 'uploads/' +res.audio_data;
          audio.load();

          audio.oncanplaythrough = function () {
            console.log("Can play through video without stopping");
            drawingConcatenator(angular.copy(res.drawing_data), audio.duration * 1000, function (res) {
              console.log('AllDOne', res);
              var test = [];
              test.push(res);
              var result = deserializeDrawing(JSON.stringify(test));
              if (result == null)
                result = "Error : Unknown error in deserializing the data";
              if (result instanceof Array == false) {
                return;
              } else {
                drawingElement.recordings = result;
                //set drawing property of each recording
                for (var i = 0; i < result.length; i++) {
                  result[i].drawing = drawingElement;
                }

                $('.video-holder').removeClass('play');
                //audio.play();
                document.getElementById('videoplayer').play();


                playRecording();
                $('.video-holder').addClass('play');
              }


            });
          };
          audio.onloadeddata = function () {
            console.log("Browser has loaded the current frame");
          };
          audio.oncanplay = function () {
            console.log("Can start playing video");
          };


        }
        else {
          alert('Create atleast one scene before making this lecture into video.')
          //$state.go('tab.dash');
          //$rootScope.$emit('user:loggedin', data);
        }
      })
    }
    else {
      //$state.go('tab.dash');
    }
  }


})();
