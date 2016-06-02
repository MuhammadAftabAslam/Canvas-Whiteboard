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

		var deleteSound = function (x) {
			console.log("calling deleteSound service ");
			var deferred = $q.defer();
			getSounds().then(function (sounds) {
				//sounds.splice(x, 1);
				//localStorage.rbboard = JSON.stringify(sounds);

				for (var i = 0; i < sounds.length; i++) {
					if (sounds[i].id === x) {
						sounds.splice(i, 1);
					}
				}
				localStorage.rbboard = JSON.stringify(sounds);
				deferred.resolve();
			});
			return deferred.promise;
		}

	var deleteAll = function() {
		console.log("calling deleteALLL");
		localStorage.clear();
		var deferred = $q.defer();
		deferred.resolve();
		return deferred.promise;
	}

	var getSounds = function() {
		var deferred = $q.defer();
		var sounds = [];

		if(localStorage.rbboard) {
			sounds = JSON.parse(localStorage.rbboard);
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
			var flag = false;
			for (var i = 0; i < sounds.length; i++) {
					if (sounds[i].id === s.id) {
						sounds[i] = s;
						flag = true;
					}
				}

			if(!flag){
				sounds.push(s);
			}
			localStorage.rbboard = JSON.stringify(sounds);
			deferred.resolve();
		});

		return deferred.promise;
	}

	var swap = function(arr) {
		console.log("calling swap services");
		var deferred = $q.defer();
		localStorage.rbboard = JSON.stringify(arr);
		deferred.resolve();
		return deferred.promise;
	}

	return {
		get:getSounds,
		save:saveSound,
		delete:deleteSound,
		deleteAll:deleteAll,
		play:playSound,
		swap:swap
	};
});

