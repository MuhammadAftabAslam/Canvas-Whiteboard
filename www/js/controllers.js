angular.module('starter.controllers', [])
  .controller('DashCtrl', ['$scope', 'Sounds', function ($scope, Sounds) {}])
  .controller('NavCtrl', function ($scope, $ionicSideMenuDelegate) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  })



  // Main directive for the canvas recordings
  .directive('arbiCanvas', ['$ionicPlatform', '$cordovaMedia', '$cordovaCapture', 'Sounds', 'recorderService','$ionicListDelegate','$ionicPopup',
    function ($ionicPlatform, $cordovaMedia, $cordovaCapture, Sounds, recorderService, $ionicListDelegate, $ionicPopup) {

      return {
        restrict: "A",
        link: function (scope, element) {
          $ionicListDelegate.showReorder(true);
          scope.shouldShowDelete = true;

          $ionicPlatform.ready(function () {
            var init = function () {
              Sounds.get().then(function (res) {
                scope.recordings = res;
              })
            }

            scope.moveItem = function (item, fromIndex, toIndex) {
              scope.recordings.splice(fromIndex, 1);
              scope.recordings.splice(toIndex, 0, item);
              Sounds.swap(scope.recordings).then(function () {
                init();
              })
            };

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
            media.timeLimit = 100;
            var $mainBtn = $('#main-btn');
            var $playBtn = $('#play-btn');
            var $saveBtn = $('#save-btn');
            var $wrapper = $('#wrapper');
            var $retakeBtn = $('#retake-btn');
            var $tinyColor = $("#colorPicker").tinycolorpicker();
            var drawingElement = new RecordableDrawing("rbcanvas");
            var currentRecording = {};

            $tinyColor.bind("change", function () {
              drawingElement.setColor($('#hidden-color').val());
            });

            media.onRecordStart = function (s) {
              console.log('onRecordStart callback: ======= >', s);
            }


            media.onPlaybackStart = function (s) {
              console.log('onPlaybackStart callback: ======= >', s);
              toggleMenu(false);
            }

           media.onConversionComplete = function (locals) {
              console.log('onConversionComplete callback: ======= >', locals);
            // onSave();
            }
/*
            media.onConversionStart = function (locals) {
              console.log('onConversionStart callback  : ======= >', locals);
            }
            */

            media.onPlaybackComplete = function (s) {
              console.log('onPlaybackComplete callback: ======= >', s);
              drawingElement.clearCanvas();
              $wrapper.removeClass('record').addClass('stop');
              toggleMenu(true);
            }



            media.onRecordComplete = function (locals) {
              console.log('onRecordComplete callback: ======= >', locals);
              $wrapper.removeClass('record');
              $wrapper.addClass('stop');
              drawingElement.stopRecording();
              media.stopRecord();
              console.log('isConverting : ',media.status.isConverting);
              console.log('isRecording : ',media.status.isRecording);
              console.log('isPlaying : ',media.status.isPlaying);
              console.log('playback : ',media.status.playback);
              onSave();
              console.log('recorderService.getHandler(); : ',recorderService.getHandler());
            }


            var c = document.getElementById("rbcanvas");
            c.width = $('#wrapper').innerWidth();//options.width;
            c.height = $(window).innerHeight();
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
                //onSave();
              }
              else if ($wrapper.hasClass('stop')) {
                $wrapper.removeClass('stop');
              }
              else {
                console.log('start recording on onclick fun');
                $wrapper.addClass('record');
                drawingElement.clearCanvas();
                drawingElement.startRecording();
                media.startRecord();
              }
            }


            var onPlay = function () {
              console.log('on play : ');
              $wrapper.removeClass('stop').removeClass('record');
              if (drawingElement.recordings.length == 0) {
                console.log('no recording exist ');
              }
              else {
                playRecording();
                media.playbackRecording();
              }
            }


            var onSave = function () {
              //$wrapper.removeClass('stop').removeClass('record');
              var serializedData = serializeDrawing(drawingElement);
              var obj = {
                canvas: serializedData,
                voice: media.save('shh'),
                id: (!$.isEmptyObject(currentRecording)) ? currentRecording.id : (new Date()).getTime()
              }
              currentRecording = obj;
              Sounds.save(obj).then(function () {
                init();
              })

            }

            scope.savedPlaying = function (obj) {
              $wrapper.removeClass('stop').removeClass('record');
              var result = deserializeDrawing(obj.canvas);
              if (result == null)
                result = "Error : Unknown error in deserializing the data";
              if (result instanceof Array == false) {
                return;
              }
              else {
                currentRecording = obj;
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

            scope.itemDelete = function (obj,flag) {
              console.log('delete in controller :');
              var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Are you sure to delete this recording?'
              });
              confirmPopup.then(function (res) {
                if (res) {
                  Sounds.delete(obj.id).then(function () {
                    init();
                  });
                } else {
                  console.log('You are not sure');
                }
              });
            }

            var toggleSideBar = function () {
              $wrapper.toggleClass('aside-active');
            }

            var clearLocalStorage = function () {
              var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Are you sure to delete all recordings?'
              });
              confirmPopup.then(function (res) {
                if (res) {
                  Sounds.deleteAll().then(function () {
                    init();
                  })
                } else {
                  console.log('You are not sure');
                }
              });
            }

            var toggleMenu = function(flag){
              if(flag){
                $mainBtn.show();
                $('#aside-opener').show();
              }
              else{
                $mainBtn.hide();
                $('#aside-opener').hide();
              }
            }

            var onRetake = function () {
              var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Are you sure for retake this recording?'
              });
              confirmPopup.then(function (res) {
                if (res) {
                  drawingElement.clearCanvas();
                  if (!$.isEmptyObject(currentRecording)) {
                    $wrapper.removeClass('stop').removeClass('record');
                      onclick();
                  }
                } else {
                  alert('select recording first');
                  console.log('You are not sure');
                }
              });
            }

            var deleteRecording = function () {
              var confirmPopup = $ionicPopup.confirm({
                title: 'Are you sure?',
                template: 'Are you sure to delete current recording?'
              });
              confirmPopup.then(function (res) {
                if (res) {
                  drawingElement.clearCanvas();
                  if (!$.isEmptyObject(currentRecording)) {
                    Sounds.delete(currentRecording.id).then(function () {
                      init();
                      $wrapper.removeClass('record');
                      currentRecording = {};
                    });

                  }
                } else {
                  alert('Sorry, No current recording that could be delete.');
                }
              });
            }

            var onNewRecording = function(){
              currentRecording = {};
              alert('Are you really want to make a new recording');
              drawingElement.clearCanvas();
              $wrapper.removeClass('stop').removeClass('record');
              onclick();
            }

            $mainBtn.bind("mousedown touch", onclick);
            $playBtn.bind("mousedown touch", onPlay);
            $saveBtn.bind("mousedown touch", onSave);
            $('#newfile-btn').bind("mousedown touch", onNewRecording);
            $retakeBtn.bind("mousedown touch", onRetake);
            $('#delete-btn').bind("mousedown touch", clearLocalStorage);
            $('#delete-recording').bind("mousedown touch", deleteRecording);
            $('#aside-opener').bind("mousedown touch", toggleSideBar);

          })

        }
      };

    }]);
