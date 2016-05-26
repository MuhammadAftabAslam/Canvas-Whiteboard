angular.module('starter.controllers', [])
  .controller('DashCtrl', ['$scope', 'Sounds', function ($scope, Sounds) {}])
  .controller('NavCtrl', function ($scope, $ionicSideMenuDelegate) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  })



  // Main directive for the canvas recordings
  .directive('arbiCanvas', ['$ionicPlatform', '$cordovaMedia', '$cordovaCapture', 'Sounds', 'recorderService',
    function ($ionicPlatform, $cordovaMedia, $cordovaCapture, Sounds, recorderService) {

      return {
        restrict: "A",
        link: function (scope, element) {

          $ionicPlatform.ready(function () {
            var init = function () {
              Sounds.get().then(function (res) {
                scope.recordings = res;
              })
            }

            init();

            /*recorderService.isReady = true;
            var onallow = function () {
              console.log('allowed : ');
            }
            var ondeny = function () {
              console.log('ondeny : ');
            }
            var closed = function () {
              console.log('closed : ');
            }
            recorderService.showPermission({
              onAllowed: onallow,
              onDenied: ondeny,
              onClosed: closed
            })*/



            var media = recorderService.controller('content');
            media.timeLimit = 10;
            var $mainBtn = $('#main-btn');
            var $playBtn = $('#play-btn');
            var $saveBtn = $('#save-btn');
            var $wrapper = $('#wrapper');
            var $tinyColor = $("#colorPicker").tinycolorpicker();
            var drawingElement = new RecordableDrawing("rbcanvas");


            $tinyColor.bind("change", function () {
              drawingElement.setColor($('#hidden-color').val());
            });

           /* media.onRecordStart = function (s) {
              console.log('onRecordStart callback: ======= >', s);
            }


            media.onPlaybackStart = function (s) {
              console.log('onPlaybackStart callback: ======= >', s);
            }

            media.onConversionComplete = function (locals) {
              console.log('onConversionComplete callback: ======= >', locals);
            }

            media.onConversionStart = function (locals) {
              console.log('onConversionStart callback  : ======= >', locals);
            }

            media.onConversionComplete = function (locals) {
              console.log('onConversionComplete callback: ======= >', locals);
            }

            */

            media.onPlaybackComplete = function (s) {
              console.log('onPlaybackComplete callback: ======= >', s);
              drawingElement.clearCanvas();
            }



            media.onRecordComplete = function (locals) {
              console.log('onRecordComplete callback: ======= >', locals);
              $wrapper.removeClass('record');
              $wrapper.addClass('stop');
              drawingElement.stopRecording();
              media.stopRecord();
            }


            var c = document.getElementById("rbcanvas");
            c.width = $('#wrapper').innerWidth();//options.width;
            c.height = $('#wrapper').innerHeight();
            var ctx = c.getContext("2d");
            ctx.fillRect(0, 0, c.width, c.height);
            ctx.lineWidth = 2;
            playbackInterruptCommand = "";

            var playRecording = function () {
              drawingElement.playRecording(function () {
                playbackInterruptCommand = "";
              }, function () {
                //if ($('#hidden-color').val())
                //drawingElement.setColor('#fff');
                //  drawingElement.setStokeSize(2);
              }, function () {
              }, function () {
                return playbackInterruptCommand;
              });
            }

            var onclick = function () {
              if ($wrapper.hasClass('record')) {
                $wrapper.removeClass('record');
                $wrapper.addClass('stop');
                drawingElement.stopRecording();
                media.stopRecord();
              }
              else if ($wrapper.hasClass('stop')) {
                $wrapper.removeClass('stop');
              }
              else {
                $wrapper.addClass('record');
                drawingElement.startRecording();
                media.startRecord();
              }
            }


            var onPlay = function () {
              $wrapper.removeClass('stop').removeClass('record');
              if (drawingElement.recordings.length == 0) {
              }
              else {
                playRecording();
                media.playbackRecording();
              }
            }


            var onSave = function () {
              $wrapper.removeClass('stop').removeClass('record');
              var serializedData = serializeDrawing(drawingElement);
              var obj = {
                canvas: serializedData,
                voice: media.save('shh'),
                id: (new Date()).getTime()
              }
              Sounds.save(obj).then(function () {
                init();
              })

            }

            scope.savedPlaying = function (obj) {
              var result = deserializeDrawing(obj.canvas);
              if (result == null)
                result = "Error : Unknown error in deserializing the data";
              if (result instanceof Array == false) {

                return;
              }
              else {
                drawingElement.recordings = result;
                //set drawing property of each recording
                for (var i = 0; i < result.length; i++) {
                  result[i].drawing = drawingElement;
                }
                $wrapper.toggleClass('aside-active');
                playRecording();
                media.playbackRecording(obj.voice);
              }
            }

            var toggleSideBar = function () {
              $wrapper.toggleClass('aside-active');
            }

            $mainBtn.bind("mousedown touch", onclick);
            $playBtn.bind("mousedown touch", onPlay);
            $saveBtn.bind("mousedown touch", onSave);
            $('#aside-opener').bind("mousedown touch", toggleSideBar);

          })

        }
      };

    }]);
