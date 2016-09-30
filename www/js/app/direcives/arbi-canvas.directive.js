(function () {
  "use strict";

  angular
    .module('starter')
    .directive('arbiCanvas', [
      '$ionicPlatform',
      '$cordovaMedia',
      '$cordovaCapture',
      'recorderService',
      '$ionicListDelegate',
      '$ionicPopup',
      '$ionicModal',
      'DrawingService',
      'UserService',
      '$state',
      '$rootScope',
      '$serverurl',
      '$cordovaFile',
      '$weburl',
      arbiCanvas
    ]);

  function arbiCanvas($ionicPlatform, $cordovaMedia, $cordovaCapture, recorderService, $ionicListDelegate, $ionicPopup, $ionicModal, DrawingService, UserService, $state, $rootScope, $serverurl, $cordovaFile, $weburl) {

    return {
      restrict: "AE",
      scope: false,
      link: function (scope, element) {
        scope.isRecording = 0;
        $ionicListDelegate.showReorder(true);
        scope.shouldShowDelete = true;

        $ionicPlatform.ready(function () {
          var init = function (project_id) {
            //scope.isloading = true;
            if (!project_id) {
              DrawingService.getInitialProject().then(function (res) {
                scope.project = res;
                scope.recordings = res ? res.scenes : '';
              });
              getAllProjects();
            } else {
              DrawingService.getInitialProject(project_id).then(function (res) {
                scope.project = res;
                scope.recordings = res.scenes;
                //scope.isloading = false;
              });
            }
          };

          var getAllProjects = function () {
            DrawingService.get().then(function (res) {
              console.log('loading end');
              scope.allProjects = res;
              //scope.isloading = false;
            });
          };

          scope.moveItem = function (item, fromIndex, toIndex) {
            scope.recordings.splice(fromIndex, 1);
            scope.recordings.splice(toIndex, 0, item);
            DrawingService.swap(scope.recordings, scope.project._id).then(function () {
              init(scope.project._id);
            })
          };

          $rootScope.$on('user:loggedin', function (event, user) {
            scope.user = user;
            init();
          });

          init();
          //window.initAccordion();
          //window.initLightbox();


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
          media.timeLimit = 1000;
          var $mainBtn = $('#main-btn');
          var $playBtn = $('#play-btn');
          var $saveBtn = $('#save-btn');
          var $wrapper = $('#wrapper');
          var $retakeBtn = $('#retake-btn');
          var drawingElement = new RecordableDrawing("rbcanvas");
          var currentRecording = {};
          var pausedAudios = [];

          /*$tinyColor.bind("change", function () {
           console.log('change color : ', $('#hidden-color').val());
           drawingElement.setColor($('#hidden-color').val());
           });*/

          media.onRecordStart = function (s) {
            //console.log('onRecordStart callback: ======= >', s);
          };

          media.onPlaybackStart = function (s) {
            $wrapper.addClass('play').removeClass('pause').removeClass('stop').removeClass('record').removeClass('video-pause');
            //console.log('onPlaybackStart callback: ======= >', s);
            //toggleMenu(false);
          };

          media.onPlaybackPause = function (s) {
            playbackInterruptCommand = "pause";
          };

          media.onPlaybackResume = function (s) {
            playbackInterruptCommand = "";
            drawingElement.resumePlayback(function () {
              console.log('drawing play back resume');
            });
          };

          media.onConversionComplete = function (locals) {
            //console.log('onConversionComplete callback: ======= >', locals);
            // onSave();
          };
          /*
           media.onConversionStart = function (locals) {
           console.log('onConversionStart callback  : ======= >', locals);
           }
           */

          media.onPlaybackComplete = function (s) {
            playbackInterruptCommand = "stop";
            drawingElement.clearCanvas();
            $wrapper.removeClass('play').removeClass('pause').removeClass('stop').removeClass('record').removeClass('video-pause');

            /*window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
             dir.getFile('test.mp3', {create: false}, function (fileEntry) {
             fileEntry.remove(function () {
             console.log('removed file');
             // The file has been removed succesfully
             }, function (error) {
             console.log('removed file error',error);
             // Error deleting the file
             }, function () {
             console.log('file does not exist');
             // The file doesn't exist
             });
             });
             });*/

          };

          var blobToDataURL = function (blob, callback) {
            var a = new FileReader();
            a.onload = function (e) {
              callback(e.target.result);
            };
            a.readAsDataURL(blob);
          };


          media.onConversionComplete = function (locals) {
            console.log('onConversionComplete callback: ======= >', locals);
            if (scope.isRecording == 2) {
              media.save('audio', function (res, bloburl, blob) {
                console.log('mp3  : pausedAudios', res, bloburl, blob);
                pausedAudios.push(blob); //pausedAudios.push({data : res,blob:blob});
              });
            } else {
              media.save('audio', function (res, bloburl, blob) {
                pausedAudios.push(blob);
                console.log('mp3 completeAudios', pausedAudios);
                ConcatenateBlobs(pausedAudios, 'audio/mp3', function (resultingBlob) {
                  blobToDataURL(resultingBlob, function (allData) {
                    onSave(allData, 'mp3');
                  })
                })
              });
            }
          };

          media.onRecordComplete = function (locals) {
            var audio = document.getElementById('videoplayer');
            var source = document.getElementById('mp3Source');
            console.log('onRecordComplete callback: ======= >');
            if (scope.isRecording == 2) {
              media.save('audio', function (res, blobObj) {
                console.log('wave  : pausedAudios', res, blobObj);
                blobToDataURL(blobObj, function (respond) {
                  pausedAudios.push(respond);
                  //source.src = concateBlob;//content; //'http://www.stephaniequinn.com/Music/Commercial%20DEMO%20-%2013.mp3'; 
                })
              });
            } else {
              console.log('audio is recording and then stop', pausedAudios);
              media.save('audio', function (res, blobObj) {
                console.log('res ee: ', res, blobObj);
                /*blobToDataURL(blobObj, function (respond) { Code for the server side call
                  pausedAudios.push(respond);
                  onSave(pausedAudios, 'amr');
                })*/
                onSave(blobObj.localURL, 'amr');
              });
            }
          };

          var c = document.getElementById("rbcanvas");
          c.width = $('#wrapper').innerWidth(); //options.width;
          c.height = $(window).innerHeight();
          var ctx = c.getContext("2d");
          //ctx.fillRect(0, 0, c.width, c.height);
          var playbackInterruptCommand = "";

          var playRecording = function () {
            drawingElement.playRecording(function () {
              playbackInterruptCommand = "";
            }, function () {
              //console.log('change color : ', $('#hidden-color').val(), '====', $('#hidden-color').value);
              /*if ($('#hidden-color').value){
               drawingElement.setColor($('#hidden-color').value);
               }*/
              //drawingElement.setStokeSize(2);
              //drawingElement.setColor('#000');
            }, function () {
              console.log('drawing playback paused');
            }, function () {
              return playbackInterruptCommand;
            });
          };

          var onclick = function () {
            if (!scope.project) {
              var confirmPopup = $ionicPopup.confirm({
                title: 'Create a project?',
                template: 'Please create a project first. It seems that you do not create any project yet.'
              });
              confirmPopup.then(function (res) {
                if (res) {
                  scope.openProjectModal();
                  return;
                } else {
                  //console.log('You are not sure');
                  return;
                }
              });
              return;
            }
            drawingElement.startRecording();
            media.startRecord();
          };


          scope.onPlay = function () {
            if (currentRecording) {
              console.log('onplay : ', currentRecording);
              scope.savedPlaying(currentRecording);
            } else {
              alert('Sorry, System do not have any recording yet. Please select from the right bar.');
            }
          };


          var onSave = function (res, type) {
            pausedAudios = [];
            scope.isloading = true;
            var serializedData = serializeDrawing(drawingElement);
            var obj = {
              drawing_data: serializedData,
              audio_data: res,
              id: (!$.isEmptyObject(currentRecording)) ? currentRecording.id : (new Date()).getTime(),
              type: type
            };
            console.log('onsave  : ', obj);
            if (scope.recordings) {
              obj.name = 'scene : ' + (scope.recordings.length + 1);
            } else {
              obj.name = 'scene :  1';
            }
            DrawingService.save(obj, scope.project._id).then(function (newObj) {
              console.log('newObj : ', newObj);
              currentRecording = newObj;
              init(scope.project._id);
              scope.isloading = false;
            })
          };

          scope.savedPlaying = function (obj) {
            console.log('savedplaying', obj);
            if (scope.modal) {
              scope.modal.hide();
            }
            var result = deserializeDrawing(obj.drawing_data);
            if (result == null)
              result = "Error : Unknown error in deserializing the data";
            if (result instanceof Array == false) {
              return;
            } else {
              currentRecording = obj;
              drawingElement.recordings = result;
              //set drawing property of each recording
              for (var i = 0; i < result.length; i++) {
                result[i].drawing = drawingElement;
              }
              playRecording();
              media.playbackRecording(obj.audio_data); //($serverurl + 'uploads/' + obj.audio_data);//SERVER CODE
            }
          };

          scope.itemDelete = function (obj, flag) {
            //console.log('delete in controller :');
            var confirmPopup = $ionicPopup.confirm({
              title: 'Are you sure?',
              template: 'Are you sure to delete this recording?'
            });
            confirmPopup.then(function (res) {
              if (res) {
                //scope.isloading = true;
                DrawingService.delete(obj._id, scope.project._id).then(function () {
                  init(scope.project._id);
                  //scope.isloading = false;
                });
              } else {
                //console.log('You are not sure');
              }
            });
          };


          scope.onRetake = function (obj) {
            currentRecording = obj;
            $wrapper.removeClass('aside-active');
            var confirmPopup = $ionicPopup.confirm({
              title: 'Retake this scene?',
              template: 'Re-taking will delete previous recording of this scene, are you sure?'
            });
            confirmPopup.then(function (res) {
              if (res) {
                drawingElement.clearCanvas();
                if (!$.isEmptyObject(currentRecording)) {

                  //onclick();
                }
              } else {
                //alert('select recording first');
                console.log('You are not sure');
              }
            });
          };

          scope.deleteRecording = function () {
            var confirmPopup = $ionicPopup.confirm({
              title: 'Are you sure?',
              template: 'Are you sure to delete current recording?'
            });
            confirmPopup.then(function (res) {
              if (res) {
                drawingElement.clearCanvas();
                if (!$.isEmptyObject(currentRecording)) {
                  //scope.isloading = true;
                  DrawingService.delete(currentRecording._id, scope.project._id).then(function () {
                    init(scope.project._id);
                    $wrapper.removeClass('record');
                    currentRecording = {};
                    //scope.isloading = false;
                  });

                }
              } else {
                alert('Sorry, No current recording that could be delete.');
              }
            });
          };

          scope.onNewRecording = function () {
            currentRecording = {};
            clickOnCanvas();
            $wrapper.removeClass('play').removeClass('pause').removeClass('stop').removeClass('record').removeClass('video-pause');
            clearCanvas();
          };

          var clickOnCanvas = function () {
            //$wrapper.removeClass('aside-active');
            //$wrapper.removeClass('menu-active');
          };

          var clearCanvas = function () {
            //$wrapper.removeClass('aside-active');
            drawingElement.clearCanvas();
          };

          scope.editRecordingName = function () {
            //scope.isloading = true;
            $wrapper.removeClass('aside-active');
            if ($('#recordingName').hasClass('form-active')) {
              if ($($('#edit-recording-text')[0]).val() != $($('#recording-text')[0]).text()) {
                currentRecording.name = $($('#edit-recording-text')[0]).val();
                DrawingService.save(currentRecording, scope.project._id).then(function () {
                  init(scope.project._id);
                  //scope.isloading = false;
                  $($('#recording-text')[0]).text(currentRecording.name);
                })
              }
              $('#recordingName').removeClass('form-active');
            } else {
              $('#recordingName').addClass('form-active');
              $($('#recording-text')[0]).text(currentRecording.name);
              $($('#edit-recording-text')[0]).val(currentRecording.name);
              $($('#edit-recording-text')[0]).focus();
            }
          };

          $($('#edit-recording-text')[0]).keydown(function (event) {
            console.log("Handler for .keydown() called.", event);
            if (event.keyCode == 13) {
              if (cordova) {
                cordova.plugins.Keyboard.close();
              }
              scope.editRecordingName();
            }
          });

          scope.openProjectModal = function () {
            console.log('open modal directive');
            $ionicModal.fromTemplateUrl('templates/project-view.html', {
              scope: scope,
              //animation: 'slide-in-up',
              //backdropClickToClose: false,
              //hardwareBackButtonClose: false
            }).then(function (modal) {
              console.log('open modal directive hode');
              scope.modal = modal;
              scope.modal.show();
            });
          };

          scope.openSceneModal = function () {
            console.log('open scene-view modal');
            $ionicModal.fromTemplateUrl('templates/scene-view.html', {
              scope: scope
            }).then(function (modal) {
              //window.initCustomForms();
              console.log('open scene view');
              scope.modal = modal;
              scope.modal.show();
            });
          };

          scope.logout = function () {
            console.log('logout');
            UserService.logout().then(function () {
              DrawingService.ClearUserData().then(function () {
                drawingElement.clearCanvas();
                $state.go('login');
              });
            })
          };

          scope.drawImageOnCanvas = function (url, id) {
            //drawingElement.setImage(url,id);
          };

          var getFileBlob = function (url, cb) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.responseType = "blob";
            xhr.addEventListener('load', function () {
              cb(xhr.response);
            });
            xhr.send();
          };

          var blobToFile = function (blob, name) {
            blob.lastModifiedDate = new Date();
            blob.name = name;
            return blob;
          };

          var getFileObject = function (filePathOrUrl, cb) {
            getFileBlob(filePathOrUrl, function (blob) {
              cb(blobToFile(blob, 'test.jpg'));
            });
          };

          $('img').click(function (event) {
            getFileObject(event.target.src, function (fileObject) {
              console.log('file object : ', fileObject);
              UserService.uploadImage(fileObject).then(function (data) {
                drawingElement.setImage($serverurl + data.data.path, data.data.filename);
              })
            });
          });


          // Execute action on hide modal
          scope.$on('modal.hidden', function () {
            if (scope.newModal && !scope.project) {
              // when there is no project
              init();
            }
          });

          scope.createProject = function () {
            console.log('open modal createProject');
            $ionicModal.fromTemplateUrl('templates/new-project.html', {
              scope: scope
            }).then(function (modal) {
              scope.newModal = modal;
              scope.newModal.show();
            });
          }

          scope.addProject = function (form) {
            //console.log('open modal addProject', form.description.$modelValue, form.useAsDefault.$modelValue);
            DrawingService.addProject({
              project_name: form.description.$modelValue || "abc",
            }, '').then(function (data) {
              scope.newModal.hide();
              getAllProjects();
            })
          };

          scope.loadProject = function (project_id) {
            init(project_id);
            scope.modal.hide();
          };


          scope.onclickRecord = function () {
            console.log('onclickrecord');
            $wrapper.addClass('record').removeClass('pause').removeClass('play').removeClass('stop');
            if (scope.isRecording == 2) { // pause to record
              drawingElement.resumeRecording();
              media.startRecord();
            } else { //first time record
              onclick();
            }
            scope.isRecording = 1;
          };


          scope.onclickPause = function () {
            console.log('pause');
            $wrapper.addClass('pause').removeClass('stop').removeClass('play').removeClass('record');
            drawingElement.pauseRecording();
            media.stopRecord();
            scope.isRecording = 2;
          };


          scope.onclickStop = function () {
            console.log('stop');
            $wrapper.addClass('stop').removeClass('pause').removeClass('play').removeClass('record');
            if (scope.isRecording == 2) { //pause and then stop
              drawingElement.stopRecording();
              media.startRecord();
              media.stopRecord();
            } else {
              drawingElement.stopRecording();
              media.stopRecord();
            }
            scope.isRecording = 0;
          };

          scope.startDragging = function (event, ui) {
            console.log('startDragging');
          };


          scope.checkPosition = function (event, ui, obj) {
            console.log('event, ui : ', event, ui, obj);
            var direction = (ui.originalPosition.top > ui.position.top) ? 1 : 0;
            console.log('has moved ' + direction);
            if (scope.modal) {
              scope.modal.hide();
            }
            if (direction == 1) {
              scope.onRetake(obj);
            } else {
              scope.itemDelete(obj);
            }
            event.preventDefault();
            event.stopPropagation();
          };

          scope.checkProjectPosition = function (event, ui, obj) {
            console.log('event, ui : ', event, ui, obj);
            var direction = (ui.originalPosition.top > ui.position.top) ? 1 : 0;
            console.log('has moved project', direction);
            if (scope.modal) {
              scope.modal.hide();
            }
            if (direction == 1) {
              scope.isloading = true;
              console.log('please open browser')
              //$state.go('video', {"key": "57c6b905280db28a0fc14561"});//obj._id});
              DrawingService.uploadCompleteProject(obj._id).then(function (res) {
                scope.isloading = false;
                if (res) {
                  console.log('directive file last point', res);
                  window.open($weburl + obj._id, '_system');
                }
                else {
                  alert('Could not connect to server. Check your internet and then try again!');
                }
              })
            } else {

            }
            event.preventDefault();
            event.stopPropagation();
          };


          $(":file").change(function () {
            if (this.files && this.files[0]) {
              var reader = new FileReader();
              reader.onload = imageIsLoaded;
              reader.readAsDataURL(this.files[0]);
              console.log('this.files[0] : ', this.files[0]);
              UserService.uploadImage(this.files[0]).then(function (data) {
                drawingElement.setImage($serverurl + data.data.path, data.data.filename);
              })
            }
          });

          function imageIsLoaded(e) {
            console.log('image is loaded')
          }


          scope.onclickPlay = function () {
            $wrapper.addClass('play').removeClass('pause').removeClass('stop').removeClass('record').removeClass('video-pause');
            if (scope.isRecording == 4) {
              // resume video


              media.playbackResume();
            } else {
              // play video first time
              scope.onPlay();
            }
            scope.isRecording = 3;
          };

          scope.onclickVideoPause = function () {
            console.log('video pause');
            $wrapper.addClass('video-pause').removeClass('pause').removeClass('stop').removeClass('record').removeClass('play');


            media.playbackPause();
            scope.isRecording = 4;
          };

          $(".color-drop > ul > li").click(function () {
            var txtClass = $(this).attr("class");
            console.log("Class Name : ", $(this));
          });


          scope.onclickVideoStop = function () {
            console.log('video stop');
            $wrapper.removeClass('play').removeClass('pause').removeClass('stop').removeClass('record').removeClass('video-pause');
            scope.isRecording = 0;

            //playbackInterruptCommand = "stop";
            media.playbackPause();
          };


          var link = $('.color-list li a'),
            holder = $('.color-picker');

          link.each(function () {
            var item = $(this);
            item.on('click touch', changeColor);

            function rgb2hex(orig) {
              var rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+)/i);
              return (rgb && rgb.length === 4) ? "#" +
              ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
              ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : orig;
            }

            function changeColor() {
              var linkClassName = item.attr('class');
              drawingElement.setColor(rgb2hex(item.css('backgroundColor')));
              holder.removeAttr('class').addClass('color-picker').addClass(linkClassName);
            }

          });
          var clickOnCanvas = function () {
            $('.tool-box').removeClass('drop-active');
          }
          $('#rbcanvas').bind("mousedown touch", clickOnCanvas);

        })

      }
    };

  }

})();
