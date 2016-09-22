(function () {
  "use strict";

  angular
    .module('starter')
    .config(config);

  function config($stateProvider, $urlRouterProvider, recorderServiceProvider) {

    recorderServiceProvider
      .forceSwf(false)
      //.setSwfUrl('/lib/recorder.swf')
      .withMp3Conversion(true, {bitRate: 32});

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

      .state('tab.dash', {
        url: '/dash',
        views: {
          'tab-dash': {
            templateUrl: 'templates/tab-dash.html',
            controller: 'DashCtrl'
          }
        }
      })
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('video', {
        url: '/video/:key',
        templateUrl: 'templates/video.html',
        controller: 'VideoCtrl'
      })
      .state('register', {
        url: '/register',
        templateUrl: 'templates/register.html',
        controller: 'LoginCtrl'
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/dash');

  }

})();
