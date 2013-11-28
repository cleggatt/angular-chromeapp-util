// TODO Replace log() with debug() when we upgrade Angular
angular.module('cleggatt.chromeapputil.storageServer', ['cleggatt.chromeapp-util.general']).

factory('$chromeStorageLocal', [function () {
    return chrome.storage.local;
}]).

// TODO Add the other properties of localstorage i.e. key
// TODO Add some other features of chrome.storage.local i.e. get all data
factory('clcChromeStorageServer', ['$injector', '$log', '$window', 'clcIsChromeApp', function ($injector, $log, $window, isChromeApp) {

    if (!isChromeApp) {
        $log.error("cleggatt.chromeapputil.storageServer: Cannot create Chrome storage server - application is not running as a Chrome application/extension");
        throw "Cannot create Chrome storage server - application is not running as a Chrome application/extension"
    }

    // We can't inject that as it won't exist if we're not running as Chrome app
    var storage =  $injector.get('$chromeStorageLocal');

    var msgListener = function (event) {

        switch(event.data.command) {

            case 'get':
                $log.log("Get value for key '" + event.data.key + "'");
                storage.get(event.data.key, function(data) {
                    $log.log("Got data...");
                    $log.log(data);

                    var message = {
                        command : 'got',
                        key: event.data.key,
                        value: data[event.data.key]
                    };
                    $log.log('Sending...');
                    $log.log(message);
                    try {
                        // It appears that the origin will always be null, but we'll use it if does turn up
                        event.source.postMessage(message, event.origin ?  event.origin :'*');
                    } catch(err) {
                        $log.error('cleggatt.chromeapputil.storageServer: Unable to send "got" message...');
                        $log.error(message);
                        $log.error(err);
                    }
                });
                break

            case 'set':
                var value = {};
                value[event.data.key] = event.data.value;

                // TODO Add a callback to notify the requester
                $log.log("Set value for key '" + event.data.key + "'");
                $log.log(value);
                storage.set(value);
                break

            case 'remove':
                // TODO Add a callback to notify the requester
                $log.log("Remove value for key '" + event.data.key + "'");
                storage.remove(event.data.key);
                break;

            default:
                $log.log('cleggatt.chromeapputil.storageServer: Ignoring unknown storage command ' + event.data.command);
                break;
        }
    };

     var server = {
        init : function() {
            $window.addEventListener('message', msgListener);
        },
        destroy : function() {
            $window.removeEventListener('message', msgListener);
        }
     };

     return server;
}]);

angular.module('cleggatt.chromeapputil.storageClient', ['cleggatt.chromeapp-util.general']).

factory('clcChromeStorageClient', ['$log', 'clcIsChromeApp', '$window', '$rootScope', function ($log, isChromeApp, $window, $rootScope) {

    if (!isChromeApp) {
        $log.error("cleggatt.chromeapputil.storageClient.chromeStorageClient: Cannot create Chrome storage client - application is not running as a Chrome application/extension");
        throw "Cannot create Chrome storage client - application is not running as a Chrome application/extension"
    }
    // TODO We probably should use some GUID for the key rather than just the key itself to allow multiple clients and
    // gets for the same key (we could invoke all callbacks for a key, but we'd need to consider response ordering)
    var callbacks = {};
    var msgListener = function(event) {

        if (!event.data) {
            return;
        }

        $log.log("Message received from storage server at " + event.origin + ": "  + JSON.stringify(event.data));

        switch(event.data.command) {
            case 'got':
                var callback = callbacks[event.data.key];
                if (callback) {
                    $rootScope.$apply(function(scope) {
                        callback(event.data.value);
                    });
                    delete callbacks[event.data.key];
                }
                else {
                    $log.warn("cleggatt.chromeapputil.storageClient.chromeStorageClient: Value obtained without pending callback for '" + event.data.key +"'");
                }
                break;

            default:
                $log.log("cleggatt.chromeapputil.storageClient.chromeStorageClient: Ignoring unknown command " + event.data.command);
                break;
        }
    }
    $window.addEventListener('message', msgListener);

    // TODO Instead of just blindly posting to the parent frame, we should have the the storage server contact us via
    // a broadcast message and then we can hold a reference to it to we can set the port correctly
    var chromeStorageClient = {
        getItem : function(key, callback) {
            // TODO Handle failure to get data
            callbacks[key] = callback;
            $window.parent.postMessage({ command: "get", key : key }, "*");
        },
        setItem : function(key, value) {
            // TODO Handle failure to store data
            $window.parent.postMessage({ command: "set", key : key, value : value }, "*");
        },
        removeItem : function(key) {
            // TODO Handle failure to remove data
            $window.parent.postMessage({ command: "remove", key : key }, "*");
        },
        destroy : function() {
            $window.removeEventListener('message', msgListener);
        }
    }

    return chromeStorageClient;
}]).

factory('clcLocalStorageClient', ['clcIsChromeApp', '$window', '$log', function (isChromeApp, $window, $log) {
    if (isChromeApp) {
        $log.error("cleggatt.chromeapputil.storageClient: Cannot create local storage client - application is running as a Chrome application/extension");
        throw "Cannot create local storage client - application is running as a Chrome application/extension"
    }

    var localStorageClient = {
        getItem : function(key, callback) {
            callback($window.localStorage.getItem(key));
        },
        setItem : function(key, value) {
            return $window.localStorage.setItem(key, value);
        },
        removeItem : function(key) {
            return $window.localStorage.removeItem(key);
        }
    }

    return localStorageClient;
}]).

factory('clcStorage', ['clcIsChromeApp', '$injector', function (isChromeApp, $injector) {
    if (isChromeApp) {
        return $injector.get('clcChromeStorageClient');
    } else {
        return $injector.get('clcLocalStorageClient');
    }
}]);