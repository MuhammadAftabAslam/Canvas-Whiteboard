media.onRecordComplete = function (locals) {
  var blobs = [];
  var testaudio = '';
  console.log('onRecordComplete callback: ======= >');
  if (scope.isRecording == 2) {
    media.save('audio', function (res, bloburl, blob) {
      console.log('wave  : pausedAudios', res, bloburl, blob);
      pausedAudios.push(res); //pausedAudios.push({data : res,blob:blob}); 
    });
  } else {
    if (scope.isRecording == 2) {
      console.log('already paused and then stop');
    } else {
      console.log('audio is recording and then stop');
      media.save('audio', function (res, bloburl, blob) {
        pausedAudios.push(res);
        console.log('wave : completeAudios', pausedAudios.length);
        function fetchAndConcatenateBlobs(file, index) {
          console.log('fetchAndConcatenateBlobs : ', file);
          window.resolveLocalFileSystemURL(file, success, fail);
          function fail(e) {
            console.error('error: ', e);
          }

          function success(fileEntry) {
            fileEntry.file(function (file) {               /*var reader = new FileReader();                reader.onloadend = function (e) {                var content = this.result;                console.log('content : ',content);                 };                reader.readAsDataURL(file);*/
              blobs.push(file);
              console.log('file : ', file);
              if (index == 0) {
                testaudio = file;
              }
              if (index == pausedAudios.length - 1) {
                ConcatenateBlobs(blobs, 'audio/amr', function (resultingBlob) {
                  console.log('resultingBlob : ', resultingBlob);
                  blobToDataURL(testaudio, function (allData) {
                    console.log('allData : ', allData);
                    console.log('testaudio : ', testaudio);
                    var audio = document.getElementById('videoplayer');
                    var source = document.getElementById('mp3Source');
                    source.src = testaudio; //'http://www.stephaniequinn.com/Music/Commercial%20DEMO%20-%2013.mp3'; 
                    audio.load(); //call this to just preload the audio without playing 
                    audio.play();
                    media.playbackRecording(pausedAudios[0]);
                    onSave(allData);
                  })
                });
              }
            });
          }
        }

        if (pausedAudios) {
          [].forEach.call(pausedAudios, fetchAndConcatenateBlobs);
        }
        /*window.resolveLocalFileSystemURL(pausedAudios[0], function(completeFileObject){           console.log('success : ',completeFileObject);          }, function(a,b,c){           console.log('a,b,c',a,b,c);         });          /*getFileBlob(pausedAudios[0], function (blob) {           console.log('blob response :',blob);         });          $cordovaFile.checkFile(cordova.file.external*, "some_file.txt")           .then(function (success) {             // success           }, function (error) {             // error           });*/
        /*var r = new FileReader();         r.onload = function (e) {           var contents = e.target.result;           console.log('readAsText :', contents);         }         r.readAsDataURL(pausedAudios[0]);           /*ConcatenateBlobs(pausedAudios, 'audio/mp3', function (resultingBlob) {          console.log('resultingBlob : ',resultingBlob);          blobToDataURL(resultingBlob, function (allData) {          console.log('allData : ',allData);          onSave(allData);          })           })*/
      });
    }
  }   //drawingElement.stopRecording();   //media.stopRecord();   /*console.log('isConverting : ', media.status.isConverting);    console.log('isRecording : ', media.status.isRecording);    console.log('isPlaying : ', media.status.isPlaying);    console.log('playback : ', media.status.playback);*/   //onSave();   //console.log('recorderService.getHandler(); : ',
  // recorderService.getHandler());
};


media.onRecordComplete = function (locals) {
  var blobs = [];
  var testaudio = '';
  console.log('onRecordComplete callback: ======= >');
  if (scope.isRecording == 2) {
    media.save('audio', function (res, bloburl, blob) {
      console.log('wave  : pausedAudios', res, bloburl, blob);
      pausedAudios.push(res); //pausedAudios.push({data : res,blob:blob});
    });
  } else {
    if (scope.isRecording == 2) {
      console.log('already paused and then stop');
    }
    else {
      console.log('audio is recording and then stop');
      media.save('audio', function (res, bloburl, blob) {
        pausedAudios.push(res);
        console.log('wave : completeAudios', pausedAudios.length);

        function fetchAndConcatenateBlobs(blob, index) {
          console.log('fetchAndConcatenateBlobs : ', blob);
          window.resolveLocalFileSystemURL(blob, success, fail);
          function fail(e) {
            console.error('error123: ', e);
          }

          function success(fileEntry) {
            fileEntry.file(function (blob) {
              var reader = new FileReader();
              reader.onloadend = function (e) {
                var content = this.result;
                //console.log('content : ',content);  

                console.log('e content : ', e);
                //media.playbackRecording(content);
              };
              reader.readAsDataURL(blob);
              blobs.push(blob);
              console.log('blob : ', blob);


              if (index == pausedAudios.length - 1) {
                console.log('index', blobs);
                ConcatenateBlobs(blobs, 'audio/mp3', function (resultingBlob) {
                  console.log('resultingBlob : ', resultingBlob);
                  //console.log('URL.createObjectURL(blob); : ', URL.createObjectURL(resultingBlob),'----');
                  //console.log('new file; : ', new File(resultingBlob, "filename.amr", {type: "audio/amr", lastModified: new Date()}),'----');
                  //console.log('new file blobs[0]; : ', new File(blobs[0], "filename1.amr", {type: "audio/amr", lastModified: new Date()}),'----');
                  //console.log('new file blobs; : ', new File(blobs, "filename1.amr", {type: "audio/amr", lastModified: new Date()}),'----');
                  //console.log('content; : ', new File(abc, "filename2.amr", {type: "audio/amr", lastModified: new Date()}),'----');
                  //console.log('URL.createObjectURL(blob); : ', URL.createObjectURL(resultingBlob),'----');

                  var pathFile = cordova.file.externalDataDirectory;
                  var fileName = "test.mp3";
                  var contentFile = resultingBlob;

                  /*if (ionic.Platform.isIOS()) {
                   var pathFile = cordova.file.documentsDirectory
                   } else {
                   var pathFile = cordova.file.externalDataDirectory
                   }*/

                  $cordovaFile.writeFile(pathFile, fileName, contentFile, true)
                    .then(function (success) {
                      //success
                      console.log('success : ', success.target.localURL);
                      //media.playbackRecording(pausedAudios[pausedAudios.length - 1])//success.target.localURL);

                    }, function (error) {
                      console.log('erorrr : ', error);
                      //console.log("errore nella creazione del report",)

                    });

                  //media.playbackRecording(URL.createObjectURL(resultingBlob));
                  //console.log('var blob =  : ',new Blob([resultingBlob], {type: 'audio/amr'}));
                  //console.log('opposite =  : ',new Blob(URL.createObjectURL(resultingBlob), {type: 'audio/amr'}));
                  /*blobToDataURL(testaudio, function (allData) {
                   console.log('allData : ', allData);
                   console.log('testaudio : ', testaudio);
                   media.playbackRecording(pausedAudios[0]);
                   onSave(allData);
                   })*/
                });
              }
            });
          }
        }


        if (pausedAudios) {
          [].forEach.call(pausedAudios, fetchAndConcatenateBlobs);
        }
      });
    }
  }
};

console.log('$(#videoplayer) : ', $('#videoplayer'));
scope.myFunction = function (a, b, c) {
  console.log('error :', a, b, c)
};


pausedAudios.push(new Blob([blobObj], {type: 'audio/mp3'}));

if (pausedAudios.length > 1) {
  console.log('wave : completeAudios', pausedAudios);
  ConcatenateBlobs(pausedAudios, 'mp3', function (resultingBlob) {
    console.log('resultingBlob : ', resultingBlob);
    var reader = new FileReader();
    reader.onloadend = function (e) {
      var content = this.result;
      console.log('final : ', e);
      var audio = document.getElementById('videoplayer');
      var source = document.getElementById('mp3Source');
      source.src = e.target.result;
    }
  })
}//content; //'http://www.stephaniequinn.com/Music/Commercial%20DEMO%20-%2013.mp3';        audio.load(); //call this to just preload the audio without playing        audio.play();       };     reader.readAsDataURL(resultingBlob);   })    } else {   console.log('else fun');   var reader = new FileReader();   reader.onloadend = function (e) {     var content = this.result;     console.log('final : ', e);     var audio = document.getElementById('videoplayer');     var source = document.getElementById('mp3Source');     source.src = e.target.result;//content; //'http://www.stephaniequinn.com/Music/Commercial%20DEMO%20-%2013.mp3';      audio.load(); //call this to just preload the audio without playing      audio.play();    };   reader.readAsDataURL(pausedAudios[0]); }  
