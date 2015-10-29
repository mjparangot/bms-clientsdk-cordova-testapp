angular.module('starter.services', [])

.factory('Requests', function() {

  var initializeBMSClient = function(url, guid) {
    BMSClient.initialize(url, guid);
    alert("BMSClient has been initialized!");
  };

  var sendRequest = function(url, method, timeout, callback) {
    var met = null
    if (method == "GET")
      met = MFPRequest.GET;
    else if (method == "PUT")
      met = MFPRequest.PUT;
    else if (method == "POST")
      met = MFPRequest.POST;
    else if (method == "DELETE")
      met = MFPRequest.DELETE;
    else if (method == "HEAD")
      met = MFPRequest.HEAD;
    else if (method == "TRACE")
      met = MFPRequest.TRACE;
    else if (method == "OPTIONS")
      met = MFPRequest.OPTIONS;

    var request = new MFPRequest(url, met, timeout);

    var success = function(successResponse) {
      alert("Request success!\n\nStatus: " + successResponse.status);
      callback(successResponse);
    }

    var failure = function(failureResponse) {
      alert("Request failure!\n\nStatus: " + failureResponse.status);
      callback(failureResponse);
    }

    request.send(success, failure);
  }

  return {
    initializeBMSClient: initializeBMSClient,
    sendRequest: sendRequest
  };
})

.factory('Loggers', function() {
  var getLogLevelClass = function(level) {
    var b_class = "button-debug";

    if (level == "INFO")
      b_class = "button-info";
    else if (level == "WARN")
      b_class = "button-warn";
    else if (level == "ERROR")
      b_class = "button-error";
    else if (level == "FATAL")
      b_class = "button-fatal";

    return b_class;
  }

  return {
    getLogLevelClass: getLogLevelClass
  };
})

.factory('Push', function() {
  
  var getSubscriptionStatus = function() {
    MFPPush.getSubscriptionStatus(function(success) {
      alert(success["subscriptions"]);
    }, function(failure) {
      alert(failure);
    });
  };

  var retrieveAvailableTags = function(tags) {
    MFPPush.retrieveAvailableTags(function(success) {
      alert(success);
    }, function(failure) {
      alert(failure);
    });
  };

  return {
    getSubscriptionStatus: getSubscriptionStatus,
    retrieveAvailableTags: retrieveAvailableTags
  }
})

.factory('Settings', function() {

  var settings = {
    logger: {

    },
    push: {
      ios: {
        alert: true,
        badge: true,
        sound: true
      },
      android: {

      }
    }
  };

  var getPushSettings = function() {
    return settings.push;
  }

  var setPushSettings = function(pushAlert, pushBadge, pushSound) {
    settings.push.ios.alert = pushAlert;
    settings.push.ios.badge = pushBadge;
    settings.push.ios.sound = pushSound;
  }


  return {
    getPushSettings: getPushSettings,
    setPushSettings: setPushSettings
  }
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
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
});
