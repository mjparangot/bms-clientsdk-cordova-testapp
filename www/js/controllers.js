var module = angular.module('starter.controllers', []);

module.run(function($rootScope) {
    $rootScope.bluemixInit = true;
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
    loggers: {},
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
module.controller('PushCtrl', function($scope, Push, Settings) {

  // tag: { 
  //  name: tags[i], 
  //  checked: bool, 
  //  subscribed: bool,
  //  class_subscribed: "text-red" 
  // }
  $scope.tagList = [];

  $scope.push = {
    registered: false,
    status: "Not Registered for Push",
    class_status: "text-red"
  };

  // Register for push notifications
  $scope.register = function() {
    MFPPush.register(Settings.getPushSettings(), null, null);
    alert(JSON.stringify(Settings.getPushSettings(), null, 4));
    $scope.registered = true;
    $scope.push.status = "Registered for Push";
    $scope.push.class_status = "text-green";
  }

  // Unregister for push notifications
  $scope.unregister = function() {
    MFPPush.unregister(null, null);
    $scope.registered = false;
    $scope.push.status = "Not Registered for Push";
    $scope.push.class_status = "text-red";
    // Clear tag list 
    $scope.$evalAsync(function() {
      $scope.tagList = [];
    });
  }

  // Subscribe to all checked tags
  $scope.subscribe = function() {
    var tags = [];
    for (var i in $scope.tagList) {
      if ($scope.tagList[i].checked) {
        $scope.tagList[i].subscribed = true;
        $scope.tagList[i].checked = false;
        $scope.tagList[i].class_subscribed = "text-green";
        tags.push($scope.tagList[i].name);
      }
    }
    // Cordova Subscribe function
    MFPPush.subscribeToTags(tags, function(success) {
      alert(success);
    }, function(failure) {
      alert(failure);
    });
  };

  // Unsubscribe from all checked tags
  $scope.unsubscribe = function() {
    var tags = [];
    for (var i in $scope.tagList) {
      if ($scope.tagList[i].checked) {
        $scope.tagList[i].subscribed = false;
        $scope.tagList[i].checked = false;
        $scope.tagList[i].class_subscribed = "text-red";
        tags.push($scope.tagList[i].name);
      }
    }
    // Cordova Unsubscribe function
    MFPPush.unsubscribeFromTags(tags, function(success) {
      alert(success);
    }, function(failure) {
      alert(failure);
    });
  };

  // Update the list of available tags
  $scope.fillTagList = function() {
    if ($scope.registered) {
      
      MFPPush.getSubscriptionStatus(function(success) {
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
                  checked: false,
                  subscribed: false,
                  class_subscribed: "text-red"
                });
              }
              // Device IS subscribed to tag
              else {
                $scope.tagList.push({
                  name: tagName,
                  checked: false,
                  subscribed: true,
                  class_subscribed: "text-green"
                });
              } 
            }

          });

        }, null);

      }, function(error) {
        return;
      });
    }
  };

  $scope.getSubscriptionStatus = Push.getSubscriptionStatus;
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

