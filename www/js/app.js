// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

var app = angular.module('starter', ['ionic', 'starter.controllers', 'starter.services']);

app.run(function($ionicPlatform, $ionicPopup, $timeout) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
      StatusBar.overlaysWebView(true);
      StatusBar.show();
    }

    // Initialize BMSClient with Route and GUID
    //BMSClient.initialize("https://HelloMatt.mybluemix.net", "36fe7be8-5eda-42c0-bf2c-19ced26a3278"); 
    
    var notification = function(notif) {
      console.log(notif);
      //alert("Body:\n\n" + notif.aps.alert.message + "\n\nPayload:\n\n" + notif.payload);
    };

    var showNotification = function(notif) {

      console.log(notif);
      console.log(JSON.stringify(notif));

      var message = notif.message
      var payload = notif.payload

      var notifAlert = {
        title: "Notification",
        template: message + "\n\n" + payload
      }

      var alertPopup = $ionicPopup.alert(notifAlert);

      $timeout(function() {
        alertPopup.close(); //close the popup after 10 seconds
      }, 10 * 1000);
    };

    MFPPush.registerNotificationsCallback(showNotification);

  });
});

app.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.request', {
    url: '/request',
    views: {
      'tab-request': {
        templateUrl: 'templates/tab-request.html',
        controller: 'RequestCtrl'
      }
    }
  })

  .state('tab.logger', {
    url: '/logger',
    views: {
      'tab-logger': {
        templateUrl: 'templates/tab-logger.html',
        controller: 'LoggerCtrl'
      }
    }
  })

  .state('tab.push', {
    url: '/push',
    views: {
      'tab-push': {
        templateUrl: 'templates/tab-push.html',
        controller: 'PushCtrl'
      }
    }
  })

  .state('tab.chats', {
    url: '/chats',
    views: {
      'tab-chats': {
        templateUrl: 'templates/tab-chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })

  .state('tab.chat-detail', {
    url: '/chats/:chatId',
    views: {
      'tab-chats': {
        templateUrl: 'templates/chat-detail.html',
        controller: 'ChatDetailCtrl'
      }
    }
  })

  .state('tab.settings', {
    url: '/settings',
    views: {
      'tab-settings': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/request');

});
