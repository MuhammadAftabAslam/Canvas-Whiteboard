angular.module('starter.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
})

.factory('Sounds', function($q) {

	var deleteSound = function(x) {
		console.log("calling deleteSound");
		var deferred = $q.defer();
		getSounds().then(function(sounds) {
			sounds.splice(x,1);
			localStorage.mysoundboard = JSON.stringify(sounds);
			deferred.resolve();
		});

		return deferred.promise;

	}

	var getSounds = function() {
		var deferred = $q.defer();
		var sounds = [];

		if(localStorage.mysoundboard) {
			sounds = JSON.parse(localStorage.mysoundboard);
		}
		deferred.resolve(sounds);

		return deferred.promise;
	}

	var playSound = function(x) {
		getSounds().then(function(sounds) {
			var sound = sounds[x];

			/*
			Ok, so on Android, we just work.
			On iOS, we need to rewrite to ../Library/NoCloud/FILE'
			*/
			var mediaUrl = sound.file;
			if(device.platform.indexOf("iOS") >= 0) {
				mediaUrl = "../Library/NoCloud/" + mediaUrl.split("/").pop();
			}
			var media = new Media(mediaUrl, function(e) {
				media.release();
			}, function(err) {
				console.log("media err", err);
			});
			media.play();
		});
	}

	var saveSound = function(s) {
		console.log("calling saveSound");
		var deferred = $q.defer();
		getSounds().then(function(sounds) {
			sounds.push(s);
			localStorage.mysoundboard = JSON.stringify(sounds);
			deferred.resolve();
		});

		return deferred.promise;
	}

	return {
		get:getSounds,
		save:saveSound,
		delete:deleteSound,
		play:playSound
	};
})
.factory('$record', [
  '$socket',
  '$account',

  function() {

    var enumerator = 0;
    var recordName = 'record-'+enumerator+'.mp3';
    var mediaRec = null;
    var OnCallback = null;
    var OnAppendData = {};

    /**
    * Start a record
    *
    * @method startRecord
    */
    function startRecord(){
      enumerator++;
      recordName = 'record-'+enumerator+'.mp3';
      mediaRec = new Media(recordName,
          function() {
          },
          function(err) {
          });
      mediaRec.startRecord();
    }

    /**
    * Stop record
    *
    * @method stopRecord
    */
    function stopRecord(){
      mediaRec.stopRecord();
    }

    /**
    * Stop record
    *
    * @method stopRecord
    */
    function playRecord(){
      mediaRec.play();
    }

    /**
    * Get the name of the record
    *
    * @method getRecord
    */
    function getRecord(){
      return recordName;
    }

    /**
    * Save the recorded file to the server
    *
    * @method save
    */
    function save(callback,appendData){
      OnCallback = callback;
      OnAppendData = appendData;
      window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, OnFileSystem, fail);
    }

    /**
    * Callback for setting the file system to persistent.
    *
    * @method OnFileSystem
    */
    function OnFileSystem(fileSystem){
      fileSystem.root.getFile(recordName, null, OnGetFile, fail);
    }

    /**
    * Callback for geting the file for disk
    *
    * @method OnGetFile
    */
    function OnGetFile(fileEntry){
      fileEntry.file(OnFileEntry, fail);
    }

    /**
    * Callback for file entry, this get the file.
    *
    * @method OnFileEntry
    */
    function OnFileEntry(file){
      var reader = new FileReader();
      reader.onloadend = function(evt) {

          var image = evt.target.result;
          var base64Data  =   image.replace(/^data:audio\/mpeg;base64,/, "");
          base64Data  +=  base64Data.replace('+', ' ');
			};
      reader.readAsDataURL(file);
    }

    /**
    * When any process of saving file fail, this console the error.
    *
    * @method OnFileEntry
    */
    function fail(err){
      console.log('Error');
      console.log(err);
    }

    /**
    * Play record
    *
    * @method playRecord
    */
    function playRecord(){
      var mediaFile = new Media(recordName,
          function() {
            console.log("playAudio():Audio Success");
          },
          function(err) {
            console.log("playAudio():Audio Error: "+err);
          }
      );
      // Play audio
      mediaFile.play();
    }

  return {
    start: startRecord,
    stop: stopRecord,
    play:playRecord,
    name:getRecord,
    save:save
  };
}]);

