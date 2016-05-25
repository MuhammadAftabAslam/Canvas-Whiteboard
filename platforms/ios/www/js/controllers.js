angular.module('starter.controllers', [])

  .controller('DashCtrl', ['$scope',function ($scope) {

  }])

  .controller('ChatsCtrl', function ($scope, Chats) {
    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    $scope.chats = Chats.all();
    $scope.remove = function (chat) {
      Chats.remove(chat);
    };
  })

  .controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
  })

  .controller('AccountCtrl', function ($scope) {
    $scope.settings = {
      enableFriends: true
    };
  })
  .controller('NavCtrl', function ($scope, $ionicSideMenuDelegate) {
    $scope.showMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    };
  })
  .directive('arbiCanvas', ['$ionicPlatform', '$cordovaMedia', '$cordovaCapture', 'Sounds','recorderService',
    function ($ionicPlatform, $cordovaMedia, $cordovaCapture, Sounds,recorderService) {

    return {
      restrict: "A",
      link: function (scope, element) {

        $ionicPlatform.ready(function () {
          console.log('recorderService  : ',recorderService);
          recorderService.isReady = true;
          var onallow = function(){
            console.log('allowed : ');
          }
          var ondeny = function(){
            console.log('ondeny : ');
          }
          var closed = function(){
            console.log('closed : ');
          }
          console.log('recorderService isAvailable : ',recorderService.isAvailable());
          console.log('recorderService showPermission : ',recorderService.showPermission({onAllowed:onallow,onDenied:ondeny,onClosed:closed}));






          var media = recorderService.controller('content');
          //media.audio-model = 'recordedInput';
          console.log('recorderService :',media , 'isHtml5() : ',media.isHtml5());
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

          media.onRecordStart = function(s){
            console.log('onRecordStart : ======= >',s);
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
              if ($('#hidden-color').val())
              //drawingElement.setColor('#fff');
                drawingElement.setStokeSize(2);
            }, function () {
            }, function () {
              //status callback
              return playbackInterruptCommand;
            });
          }

          var onclick = function () {
            console.log("do something on every change of color", $wrapper.hasClass('record'));
            if ($wrapper.hasClass('record')) {
              $wrapper.removeClass('record');
              $wrapper.addClass('stop');
              drawingElement.stopRecording();
              media.stopRecord();
              //media.save('test-aftab')

            }
            else if ($wrapper.hasClass('stop')) {
              $wrapper.removeClass('stop');
            }
            else {
              $wrapper.addClass('record');
              drawingElement.startRecording();
              media.startRecord();
            }
            testfun();
          }


          var onPlay = function () {
            console.log('play : ',media);
            $wrapper.removeClass('stop').removeClass('record');
            if (drawingElement.recordings.length == 0) {
              alert("No recording to play");
              console.log("No recording to play");
            }
            else {
              playRecording();
              media.playbackRecording();
            }
            media.save('shh')
          }


          var onSave = function () {
            $wrapper.removeClass('stop').removeClass('record');
            var serializedData = serializeDrawing(drawingElement);
            console.log('serializedData : ', serializedData);

            var result = deserializeDrawing(serializedData);
            if (result == null)
              result = "Error : Unknown error in deserializing the data";
            if (result instanceof Array == false) {
              console.log('error occured on instance ');
              return;
            }
            else {
              //data is successfully deserialize
              drawingElement.recordings = result;
              //set drawing property of each recording
              for (var i = 0; i < result.length; i++) {
                result[i].drawing = drawingElement;
              }
              playRecording();
            }
          }

          var testfun = function () {
            console.log('media testfun :', media);
/*            console.log('media testfun isRecording:', media.isRecording);
            console.log('media testfun isDenied:', media.isDenied);
            console.log('media testfun isPlaying:', media.isPlaying);
            console.log('media testfun isPaused:', media.isPaused);
            console.log('media testfun isConverting:', media.isConverting);
            console.log('media testfun isAvailable:', media.isAvailable);
            console.log('media testfun playback:', media.playback);
            console.log('media testfun elapsedTime:', media.elapsedTime);
            console.log('media testfun isHtml5:', media.isHtml5());*/
          }

          $mainBtn.bind("mousedown touch", onclick);
          $playBtn.bind("mousedown touch", onPlay);
          $saveBtn.bind("mousedown touch", onSave);
          $('.btn-primary').bind("mousedown touch", testfun);
        })

      }
    };

  }]);
