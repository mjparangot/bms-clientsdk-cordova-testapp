var module = angular.module('starter.controllers', []);

//BMSClient and MFPRequest
module.controller('RequestCtrl', function($scope, Requests) {

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
module.controller('PushCtrl', function($scope, Push) {

  // Update the list of available tags
  $scope.fillTagList = function() {
    MFPPush.retrieveAvailableTags(function(tags) {
      $scope.tagList = []
      $scope.$evalAsync(function() {
        for (var i in tags) {
          $scope.tagList.push({
            name: tags[i], 
            checked: false, 
            subscribed: false,
            class_subscribed: "text-red"
          });
        }
      });
    }, null);

    // UPDATE LIST TO INDICATE SUBSCRIBED TAGS
  };

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
    //MFPPush.subscribeToTags(tags, null, null);
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
    //MFPPush.unsubscribeFromTags(tags, null, null);
  };

  $scope.getSubscriptionStatus = Push.getSubscriptionStatus;
  $scope.retrieveAvailableTags = Push.retrieveAvailableTags;

  // tag: { name: tags[i], subscribed: false }
  $scope.tagList = [];
});

// Chats Detail example
module.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
});

// Settings for all plugin components
module.controller('SettingsCtrl', function($scope, $timeout) {
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
      enabled: false
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
});

