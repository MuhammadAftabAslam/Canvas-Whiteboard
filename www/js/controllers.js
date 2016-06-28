angular.module('starter.controllers', [])
  .controller('DashCtrl', ['$scope', 'Sounds', function ($scope, Sounds) {}])
  .controller('NavCtrl', function ($scope, $ionicSideMenuDelegate) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  })

  // Main directive for the canvas recordings
  .directive('arbiCanvas', ['$ionicPlatform', '$cordovaMedia', '$cordovaCapture', 'Sounds', 'recorderService', '$ionicListDelegate', '$ionicPopup',
    function ($ionicPlatform, $cordovaMedia, $cordovaCapture, Sounds, recorderService, $ionicListDelegate, $ionicPopup) {

      return {
        restrict: "AE",
        scope: false,
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
			window.initTooltip();
			window.initAccordion();


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
              console.log('change color : ',$('#hidden-color').val());
              drawingElement.setColor($('#hidden-color').val());
            });

            media.onRecordStart = function (s) {
              //console.log('onRecordStart callback: ======= >', s);
            }


            media.onPlaybackStart = function (s) {
              //console.log('onPlaybackStart callback: ======= >', s);
              toggleMenu(false);
            }

            media.onConversionComplete = function (locals) {
              //console.log('onConversionComplete callback: ======= >', locals);
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
              $($('#recording-text')[0]).text(currentRecording.name);
              $($('#edit-recording-text')[0]).val(currentRecording.name);
              $wrapper.removeClass('record').addClass('stop');
              toggleMenu(true);
            }


            media.onRecordComplete = function (locals) {
              console.log('onRecordComplete callback: ======= >', locals);
              $wrapper.removeClass('record');
              $wrapper.addClass('stop');
              drawingElement.stopRecording();
              media.stopRecord();
              /*console.log('isConverting : ', media.status.isConverting);
              console.log('isRecording : ', media.status.isRecording);
              console.log('isPlaying : ', media.status.isPlaying);
              console.log('playback : ', media.status.playback);*/
              onSave();
              //console.log('recorderService.getHandler(); : ', recorderService.getHandler());
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
                console.log('change color : ',$('#hidden-color').val(),'====',$('#hidden-color').value);
                /*if ($('#hidden-color').value){
                  drawingElement.setColor($('#hidden-color').value);
                }*/
                //drawingElement.setStokeSize(2);
                //drawingElement.setColor('#000');
              }, function () {
              }, function () {
                return playbackInterruptCommand;
              });
            }

            var onclick = function () {
              $wrapper.removeClass('aside-active');
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
                //drawingElement.clearCanvas();
                drawingElement.startRecording();
                //drawingElement.setColor($('#hidden-color').value);
		            //drawingElement.setStokeSize(2);
                media.startRecord();
              }
            }
			

            scope.onPlay = function () {
              $('.btns-holder a').css({
                opacity :  1
              });
              /*console.log('on play : ');
               $wrapper.removeClass('stop').removeClass('record').removeClass('aside-active');
               if (drawingElement.recordings.length == 0) {
               console.log('no recording exist ');
               }
               else {
               playRecording();
               media.playbackRecording();
               }*/
              if (!$.isEmptyObject(currentRecording)) {
                scope.savedPlaying(currentRecording);
              }
              else {
                alert('Sorry, System do not have any recording yet. Please select from the right bar.');
              }
            }


            scope.changeColorOnDrag = function () {

              var btn = $('.ui-draggable-dragging'),
                color = '#fff';
<<<<<<< HEAD
								
				btn.each(function(index){
					var item = $(this),
						currColor = item.css('color');
					
					
					item.animate({
						color : color
					},function(){
						color = currColor;
						item.css('color',currColor);
					});
				});
=======

              btn.each(function () {
                var item = $(this),
                  currColor = item.css('color');

                item.animate({
                  color: color
                }, function () {
                  color = currColor;
                  item.css('color', currColor);
                });
              });
>>>>>>> 1b6d632aefdd7a5f1e7c2193a6a5714cb95cfca1
            }



            var onSave = function () {
              //$wrapper.removeClass('stop').removeClass('record');
              var serializedData = serializeDrawing(drawingElement);
              media.save('shh', function (res) {
                var obj = {
                  canvas: serializedData,
                  voice: res,
                  id: (!$.isEmptyObject(currentRecording)) ? currentRecording.id : (new Date()).getTime()
                }
                if(scope.recordings){
                   obj.name =  'scene : '+(scope.recordings.length + 1);
                }
                else{
                  obj.name =  'scene :  1';
                }
                currentRecording = obj;
                $($('#recording-text')[0]).text(obj.name);
                $($('#edit-recording-text')[0]).val(obj.name);
                Sounds.save(obj).then(function () {
                  init();
                })
              });
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
                $wrapper.removeClass('aside-active');
                playRecording();
                media.playbackRecording(obj.voice);
              }
            }

            scope.itemDelete = function (obj, flag) {
              //console.log('delete in controller :');
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
                  //console.log('You are not sure');
                }
              });
            }

            var toggleSideBar = function () {
				$wrapper.removeClass('menu-active');
              $wrapper.toggleClass('aside-active');
            }
			
			var toggleImagesAside = function () {
			  $wrapper.removeClass('aside-active');
              $wrapper.toggleClass('menu-active');
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

            var toggleMenu = function (flag) {
              if (flag) {
                $mainBtn.show();
                $('#aside-opener').show();
              }
              else {
                $mainBtn.hide();
                $('#aside-opener').hide();
              }
            }

            scope.onRetake = function () {
              $wrapper.removeClass('aside-active');
              var confirmPopup = $ionicPopup.confirm({
                title: 'Retake this scene?',
                template: 'Re-taking will delete previous recording of this scene, are you sure?'
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

            scope.deleteRecording = function () {
              $wrapper.removeClass('aside-active');
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

            scope.onNewRecording = function () {
              currentRecording = {};
              $wrapper.removeClass('stop').removeClass('record');
              $wrapper.removeClass('aside-active');
            }

            var clickOnCanvas = function () {
              $wrapper.removeClass('aside-active');
			  $wrapper.removeClass('menu-active');
            }

            var clearCanvas = function () {
              $wrapper.removeClass('aside-active');
              drawingElement.clearCanvas();
            }

            scope.editRecording = function () {
              $wrapper.removeClass('aside-active');
              if ($('#recordingName').hasClass('form-active')) {
                if ($($('#edit-recording-text')[0]).val() != $($('#recording-text')[0]).text()) {
                  currentRecording.name = $($('#edit-recording-text')[0]).val();
                  Sounds.save(currentRecording).then(function () {
                    init();
                    $($('#recording-text')[0]).text(currentRecording.name);
                  })
                }
                $('#recordingName').removeClass('form-active');
              }
              else {
                $('#recordingName').addClass('form-active');
                $($('#recording-text')[0]).text(currentRecording.name);
                $($('#edit-recording-text')[0]).val(currentRecording.name);
				        $($('#edit-recording-text')[0]).focus();
              }
            }

            $($('#edit-recording-text')[0]).keydown(function (event) {
              console.log("Handler for .keydown() called.",event);
              if(event.keyCode == 13){
                if(cordova) {
                  cordova.plugins.Keyboard.close();
                }
                scope.editRecording();
              }
            });
            //var onPlay = scope.onPlay;
            //$playBtn.on('swipedown',onPlay );
            //$retakeBtn.on('swipedown',onRetake );
            //$('#newfile-btn').on('swipedown',onNewRecording );
            //$('#delete-recording').on('swipedown', deleteRecording);
            //$playBtn.on('on-drag-down',scope.editRecording12 );
            $mainBtn.bind("mousedown touch", onclick);
            //$playBtn.bind("mousedown touch", onPlay);
            //$playBtn.bind("dragstart onDragDown", scope.editRecording12);
            //$saveBtn.bind("mousedown touch", onSave);
            //$('#newfile-btn').bind("mousedown touch", onNewRecording);
            //$retakeBtn.bind("mousedown touch", onRetake);
            //$('#delete-recording').bind("mousedown touch", deleteRecording);
            $('#delete-btn').bind("mousedown touch", clearLocalStorage);
            $('#aside-opener').bind("mousedown touch", toggleSideBar);
            $('#menu-opener').bind("mousedown touch", toggleImagesAside);
            $('#rbcanvas').bind("mousedown touch", clickOnCanvas);
            $('#btn-clear').bind("mousedown touch", clearCanvas);
            $('#recordingName').bind("mousedown touch", scope.editRecording);
            //$('.btn-list').bind("mousedown touch", clickOnOutsideForRecordingName);

          })

        }
      };

    }]);