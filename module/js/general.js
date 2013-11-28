angular.module('cleggatt.chromeapp-util.general', []).

factory('clcIsChromeApp', ['$window', function ($window) {
    return $window.location.protocol == "chrome-extension:" ? true : false;
}]);
