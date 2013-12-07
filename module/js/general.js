angular.module('cleggatt.chromeapp-util.general', []).

// We do this as a provider so that it can be accessed in config() blocks
provider('clcIsChromeApp',  ['$windowProvider', function ($windowProvider) {
    var protocol = $windowProvider.$get().location.protocol;
    var isChromeApp = (protocol == "chrome-extension:") ? true : false;

    this.$get = function() {
        return isChromeApp;
    };
}]);