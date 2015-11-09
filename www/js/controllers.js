var module = angular.module('starter.controllers', []);

var success = function(res) {
  console.log(res);
};

var failure = function(res) {
  console.log(res);
};

module.run(function($rootScope) {
    $rootScope.bluemixInit = true;
    $rootScope.pushDisabled = true;
});

//BMSClient and MFPRequest
module.controller('RequestCtrl', function($scope, $rootScope, Requests) {

  $scope.bms = {
    url: "https://HelloMatt.mybluemix.net",
    guid: "36fe7be8-5eda-42c0-bf2c-19ced26a3278"
  };

  $scope.query = {
    url: "https://HelloMatt.mybluemix.net",
    method: "GET",
    timeout: 20000,
    response: ""
  };

  $scope.$watch("query", function() {
    console.log("changed");
  }, true);

  $scope.initialize = function() {
    Requests.initializeBMSClient($scope.bms.url, $scope.bms.guid);
    $rootScope.bluemixInit = false;
  };

  $scope.sendRequest = function() {
    Requests.sendRequest($scope.query.url, $scope.query.method, $scope.query.timeout, function(res) {
      $scope.$evalAsync(function() {
        $scope.query.response = JSON.stringify(res.responseText);
      });
    });
  };

  $scope.clearResponse = function() {
    $scope.$evalAsync(function() {
      $scope.query.response = "";
    });
  };
});

// Chats example
module.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();

  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
});

// MFPLogger
module.controller('LoggerCtrl', function($scope, Loggers) {

  $scope.logger = {
    name: null,
    selected: null,
    message: null,
    level: "INFO",
    logCount: 0,
    class_logLevel: "button-stable",
    loggers: {
      //default logger used for debugging
      logger: {
        name: MFPLogger.getInstance("logger")
      }
    },
  };

  //$scope.logger.class_logLevel = Loggers.getLogLevelClass($scope.logger.level);

  // Watch log level and update button when log level is changed
  $scope.$watch("logger.level", function() {
    $scope.$evalAsync(function() {
      $scope.logger.class_logLevel = Loggers.getLogLevelClass($scope.logger.level);;
    });
  });

  // Add a logger instance with specified name
  $scope.addLoggerInstance = function() {
    var name = $scope.logger.name;
    
    // Make sure not to add duplicate logger
    if($scope.logger.loggers[name] == null) {
      $scope.logger.loggers[name] = {name: MFPLogger.getInstance(name)};
    }
    else {
      alert("Logger instance already exists!");
      return;
    }

    alert("Logger instance added: " + name);
  };

  // Capture the specific log of the logger instance
  $scope.captureLog = function() {
    var name = $scope.logger.selected;
    var level = $scope.logger.level;
    var message = $scope.logger.message;
    var myLogger = MFPLogger.getInstance(name);

    //alert(name + " | " + level + " | " + message);

    if (level == "INFO")
      myLogger.info(message);
    else if (level == "DEBUG")
      myLogger.debug(message);
    else if (level == "WARN")
      myLogger.warn(message);
    else if (level == "ERROR")
      myLogger.error(message);
    else if (level == "FATAL")
      myLogger.fatal(message);

    // Update log count
    $scope.logger.logCount++;
  };

  // Send logs to server
  $scope.sendLogs = function() {
    var count = $scope.logger.logCount;
    if ($scope.logger.logCount > 0) {
      MFPLogger.send();
      $scope.logger.logCount = 0;
      alert(count + " logs sent. Check your app dashboard to see logs.");
    }
  };
});

// MFPPush
module.controller('PushCtrl', function($scope, $rootScope, Push, Settings) {

  // tag: { 
  //  name: string,
  //  subscribed: bool,
  //  class_subscribed: "text-red" 
  // }
  $scope.tagList = [];

  $scope.push = {
    registered: false,
    status: "Not Registered for Push",
    class_status: "text-red",
    tagSelected: null
  };

  // Register for push notifications
  $scope.registerDevice = function() {
    MFPPush.registerDevice(Settings.getPushSettings(), success, failure);
    alert(JSON.stringify(Settings.getPushSettings(), null, 4));
    $scope.registered = true;
    $scope.push.status = "Registered for Push";
    $scope.push.class_status = "text-green";
    $rootScope.pushDisabled = false;
  }

  // Unregister for push notifications
  $scope.unregisterDevice = function() {
    MFPPush.unregisterDevice(success, failure);
    $scope.registered = false;
    $scope.push.status = "Not Registered for Push";
    $scope.push.class_status = "text-red";
    $rootScope.pushDisabled = true;
    // Clear tag list 
    $scope.$evalAsync(function() {
      $scope.tagList = [];
    });
  }

  // Subscribe to all checked tags
  $scope.subscribe = function() {

    // CAN OPTIMIZE: USE MAP INSTEAD OF SEARCHING THROUGH TAGLIST ARRAY
    // Update subscribed status of tag
    var i = 0
    while ($scope.tagList[i].name != $scope.push.tagSelected && i < $scope.tagList.length) {
      i++;
    }
    if (i < $scope.tagList.length) {
      // Cordova Subscribe function
      MFPPush.subscribe($scope.push.tagSelected, function(success) {
        alert(JSON.stringify(success));
      }, function(failure) {
        alert(JSON.stringify(failure));
      });

      // Update available tag list
      $scope.$evalAsync(function() {
        $scope.tagList[i].subscribed = true;
        $scope.tagList[i].class_subscribed = "text-green";
        $scope.push.tagSelected = null;
      });
    }
  };

  // Unsubscribe from all checked tags
  $scope.unsubscribe = function() {

    // CAN OPTIMIZE: USE MAP INSTEAD OF SEARCHING THROUGH TAGLIST ARRAY
    // Update subscribed status of tag
    var i = 0
    while ($scope.tagList[i].name != $scope.push.tagSelected && i < $scope.tagList.length) {
      i++;
    }
    if (i < $scope.tagList.length) {
      // Cordova Subscribe function
      MFPPush.unsubscribe($scope.push.tagSelected, function(success) {
        alert(JSON.stringify(success));
      }, function(failure) {
        alert(JSON.stringify(failure));
      });

      // Update available tag list
      $scope.$evalAsync(function() {
        $scope.tagList[i].subscribed = false;
        $scope.tagList[i].class_subscribed = "text-red";
        $scope.push.tagSelected = null;
      });
    }
  };

  // Update the list of available tags
  $scope.updateAvailableTags = function() {
    if ($scope.registered) {
      MFPPush.retrieveSubscriptionStatus(function(success) {
        var subs = success;
        MFPPush.retrieveAvailableTags(function(tags) {
          $scope.tagList = [];
          $scope.$evalAsync(function() {

            for (var i in tags) {
              var tagName = tags[i];
              // Device IS NOT subscribed to tag
              if (subs.indexOf(tagName) == -1) {
                $scope.tagList.push({
                  name: tagName,
                  subscribed: false,
                  class_subscribed: "text-red"
                });
              }
              // Device IS subscribed to tag
              else {
                $scope.tagList.push({
                  name: tagName,
                  subscribed: true,
                  class_subscribed: "text-green"
                });
              } 
            }
            $scope.push.tagSelected = null;
          });

        }, null);

      }, function(error) {
        return;
      });
    }
    else {
      alert("Not registered for push notifications!");
    }
  };

  $scope.retrieveSubscriptionStatus = Push.retrieveSubscriptionStatus;
  $scope.retrieveAvailableTags = Push.retrieveAvailableTags;
});

// Chats Detail example
module.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});

// Settings for all plugin components
module.controller('SettingsCtrl', function($scope, Settings) {
  $scope.settings = {
    logger: {
      enabled: true,
      minLogLevel: "INFO"
    },
    analytics: {
      enabled: true
    },
    push: {
      class_enabledIcon: "ion-android-notifications-off",
      enabled: false,
      type: {
        alert: true,
        badge: true,
        sound: true
      }
    }
  };

  // PROBLEM: Capture is getting updated properly as verified in console, but call to getCapture
  // returns old value of capture
  // TODO: Figure out how to call function in correct order.
  $scope.getCapture = function() {
    MFPLogger.getCapture(function(isCapture) {
      //alert("Capture is now " + isCapture);
    });
  };

  // Watch set capture option and set capture when enabled
  $scope.$watch("settings.logger.enabled", function() {
    MFPLogger.setCapture($scope.settings.logger.enabled);
  });

  // Watch minimum log level and set log level when changed
  $scope.$watch("settings.logger.minLogLevel", function() {
    MFPLogger.setLevel($scope.settings.logger.minLogLevel);
    //alert("Log Level: " + $scope.settings.logger.minLogLevel);
  });

  $scope.$watch("settings.push.enabled", function() {
    if ($scope.settings.push.enabled)
      $scope.settings.push.class_enabledIcon = "ion-android-notifications";
    else
      $scope.settings.push.class_enabledIcon = "ion-android-notifications-off";
  });


  // Watch push types and update push settings when changed
  $scope.$watch("settings.push.type", function() {
    var pushAlert = $scope.settings.push.type.alert;
    var pushBadge = $scope.settings.push.type.badge;
    var pushSound = $scope.settings.push.type.sound;
    Settings.setPushSettings(pushAlert, pushBadge, pushSound);
  }, true);
});

