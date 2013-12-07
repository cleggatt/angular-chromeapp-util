'use strict';

describe('a local storage client', function() {

    beforeEach(function () {
        module('cleggatt.chromeapputil.storageClient');
        module(function($provide) {

            var mockWindow = {};
            mockWindow.localStorage = jasmine.createSpyObj('localStorage', ['setItem', 'getItem', 'removeItem']);

            $provide.value('clcIsChromeApp', false);
            $provide.value('$window', mockWindow);
        });
    });

    it('will be defined', inject(['clcLocalStorageClient', function(localStorageClient) {
        expect(localStorageClient).toBeDefined();
    }]));

    it('will delegate getItem() to localStorage.getItem()', inject(['clcLocalStorageClient', '$window', function(localStorageClient, $window) {
        // Set up
        $window.localStorage.getItem.andCallFake(function(key) {
            return('got_' + key);
        });
        // Exercise
        var result;
        localStorageClient.getItem('the_key', function(value) {
            result = value;
        });
        // Verify
        expect($window.localStorage.getItem).toHaveBeenCalledWith('the_key');
        expect(result).toEqual('got_the_key');
    }]));

    it('will delegate setItem() to localStorage.setItem()', inject(['clcLocalStorageClient', '$window', function(localStorageClient,  $window) {
        // Exercise
        localStorageClient.setItem('the_key', 'a_value');
        // Verify
        expect($window.localStorage.setItem).toHaveBeenCalledWith('the_key', 'a_value');
    }]));

    it('will delegate removeItem() to localStorage.getItem()', inject(['clcLocalStorageClient', '$window', function(localStorageClient, $window) {
        // Exercise
        localStorageClient.removeItem('the_key');
        // Verify
        expect($window.localStorage.removeItem).toHaveBeenCalledWith('the_key');
    }]));
});

describe('obtaining a local storage client in Chrome application', function() {
    beforeEach(function () {
        module('cleggatt.chromeapputil.storageClient');
        module(function($provide) {
            $provide.value('clcIsChromeApp', true);
        });
    });

    it('will throw an error', inject(function($injector) {
        expect(function() { $injector.get('clcLocalStorageClient') }).toThrow();
    }));
});

describe('a Chrome application storage client', function() {

    beforeEach(function () {
        module('cleggatt.chromeapputil.storageClient');
        module(function($provide) {
            $provide.value('clcIsChromeApp', true);
        });
    });

    afterEach(inject(['clcChromeStorageClient', function(chromeStorageClient) {
        chromeStorageClient.destroy();
    }]));

    it('will be defined', inject(['clcChromeStorageClient', function(chromeStorageClient) {
        expect(chromeStorageClient).toBeDefined();
    }]));

    it('will call postMessage() to retrieve data', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Set up
        spyOn($window.parent, 'postMessage');
        // Exercise
        chromeStorageClient.getItem('the_key', function(value) {});
        // Verify
        expect($window.parent.postMessage).toHaveBeenCalledWith({ command: "get", key : 'the_key' }, "*");
    }]));

    it('will listen for a response after calling postMessage() to retrieve data', inject(['clcChromeStorageClient',  '$window', '$rootScope', function(chromeStorageClient, $window, $rootScope) {
        // Set up
        var callback;
        spyOn($rootScope, '$apply').andCallFake(function(fn) {
            callback = fn;
        });
        // Exercise
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage({ command: "got", key: 'the_key', value : 'a_value' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect(result).toBeUndefined();
            callback();
            expect(result).toEqual('a_value');
        });
    }]));

    it('will only listen for one response for a given key', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Exercise
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage({ command: "got", key: 'the_key', value : 'a_value' }, "*");
        })
        waitsForMessage($window);
        runs(function () {
            $window.postMessage({ command: "got", key: 'the_key', value : 'another_value' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect(result).toEqual('a_value');
        });
    }]));

    it('will do nothing if there is no pending callback for the key', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Exercise
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage({ command: "got", key: 'another_key', value : 'a_value' }, "*");
        });
        // Verify by lack of errors
        waitsForMessage($window);
        runs(function () {
            expect(result).toBeUndefined();
        });
    }]));

    it('will only listen for "got" messages', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Exercise
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage({ command: "other", key: 'the_key', value : 'a_value' }, "*");
        });
        // Verify by lack of errors
        waitsForMessage($window);
        runs(function () {
            expect(result).toBeUndefined();
        });
    }]));

    it('will ignore messages without data', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Exercise
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage(undefined, "*");
        });
        // Verify by lack of errors
        waitsForMessage($window);
        runs(function () {
            expect(result).toBeUndefined();
        });
    }]));

    it('will call postMessage() to store data', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient,  $window) {
        // Set up
        spyOn($window.parent, 'postMessage');
        // Exercise
        chromeStorageClient.setItem('the_key', 'a_value');
        // Verify
        expect($window.parent.postMessage).toHaveBeenCalledWith({ command: "set", key: 'the_key', value: 'a_value' }, "*" );
    }]));

    it('will call postMessage() to remove data', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Set up
        spyOn($window.parent, 'postMessage');
        // Exercise
        chromeStorageClient.removeItem('the_key');
        // Verify
        expect($window.parent.postMessage).toHaveBeenCalledWith({ command: "remove", key: 'the_key' }, "*");
    }]));

    it('will stop handling messages when destroyed', inject(['clcChromeStorageClient', '$window', function(chromeStorageClient, $window) {
        // Exercise
        chromeStorageClient.destroy();
        // Verify
        var result;
        runs(function () {
            chromeStorageClient.getItem('the_key', function(value) {
                result = value;
            });
            $window.postMessage({ command: "got", key: 'the_key', value : 'a_value' }, "*");
        })
        waitsForMessage($window);
        runs(function () {
            expect(result).toBeUndefined();
        });
    }]));
});

describe('obtaining a Chrome application storage client in non-Chrome application', function() {
    beforeEach(function () {
        module('cleggatt.chromeapputil.storageClient');
        module(function($provide) {
            $provide.value('clcIsChromeApp', false);
        });
    });

    it('will throw an error', inject(function($injector) {
        expect(function() { $injector.get('clcChromeStorageClient') }).toThrow();
    }));
});

describe('a storage service', function() {

    describe('in non-Chrome application', function() {

        var mockLocalStorageClient = jasmine.createSpy('local storage client');

        beforeEach(function () {
            module('cleggatt.chromeapputil.storageClient');
            module(function($provide) {
                $provide.value('clcIsChromeApp', false);
                $provide.value('clcLocalStorageClient', mockLocalStorageClient);
                $provide.factory('clcChromeStorageClient', function() {
                    throw "Should not attempt to inject clcChromeStorageClient directly"
                });
            });
        });

        it('will be defined', inject(['clcStorage', function(storage) {
            expect(storage).toBeDefined();
        }]));

        it('will return localStorage', inject(['clcStorage', function(storage) {
            expect(storage).toBe(mockLocalStorageClient);
        }]));
    });

    describe('in a Chrome application', function() {

        var mockChromeStorageClient = jasmine.createSpy('Chrome storage client');

        beforeEach(function () {
            module('cleggatt.chromeapputil.storageClient');
            module(function($provide) {
                $provide.value('clcIsChromeApp', true);
                $provide.value('clcChromeStorageClient', mockChromeStorageClient);
                $provide.factory('clcLocalStorageClient', function() {
                    throw "Should not attempt to inject localStorageClient directly"
                });
            });
        });

        it('will be defined', inject(['clcStorage', function(storage) {
            expect(storage).toBeDefined();
        }]));

        it('will be return a Chrome storage client', inject(['clcStorage', function(storage) {
            expect(storage).toBe(mockChromeStorageClient);
        }]));
    });
});