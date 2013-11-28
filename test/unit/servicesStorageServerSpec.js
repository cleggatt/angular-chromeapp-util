'use strict';

beforeEach(module('cleggatt.chromeapputil.storageServer'));

describe('an un-initialised a Chrome application storage server', function() {

    var mockStorage;

    beforeEach(function () {
        module(function($provide) {
            mockStorage = jasmine.createSpyObj('$chromeStorageLocal', ['set', 'get', 'remove']);

            $provide.value('clcIsChromeApp', true);
            $provide.value('$chromeStorageLocal', mockStorage);
        });
    });

    it("will not handle messages until it has been initialised", inject(function($window, $chromeStorageLocal) {
        // Exercise
        runs(function () {
            $window.postMessage({ command: "get", key: 'the_key' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect($chromeStorageLocal.get).not.toHaveBeenCalledWith(jasmine.any(Object), jasmine.any(Function));
        });
    }));
});

describe("a Chrome application storage server", function() {

    var mockStorage;

    beforeEach(function () {
        module(function($provide) {
            mockStorage = jasmine.createSpyObj('$chromeStorageLocal', ['set', 'get', 'remove']);

            $provide.value('clcIsChromeApp', true);
            $provide.value('$chromeStorageLocal', mockStorage);
        });
    });

    beforeEach(inject(['clcChromeStorageServer', function(storageServer) {
        storageServer.init();
    }]));

    afterEach(inject(['clcChromeStorageServer', function(storageServer) {
        storageServer.destroy();
    }]));

    it("will be defined", inject(['clcChromeStorageServer', function(storageServer) {
        expect(storageServer).toBeDefined();
    }]));

    it("will retrieve data in response to a 'get' message", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal) {
        // Exercise
        runs(function () {
            $window.postMessage({ command: 'get', key: 'the_key' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect($chromeStorageLocal.get).toHaveBeenCalledWith('the_key', jasmine.any(Function));

            expect($chromeStorageLocal.set).not.toHaveBeenCalled();
            expect($chromeStorageLocal.remove).not.toHaveBeenCalled();
        });
    }]));

    it("will post retrieved data back to the message sender", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal) {
        // Set up
        runs(function () {
            $window.postMessage({ command: 'get', key: 'the_key' }, "*");
        });
        waitsForMessage($window);
        var data;
        var listener = function(event) {
            data = event.data;
        };
        // Exercise
        runs(function () {
            $window.addEventListener('message', listener);
            $chromeStorageLocal.get.mostRecentCall.args[1]({ the_key : 'some_value' });
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            $window.removeEventListener('message', listener);

            expect(data).toEqual({
                command : 'got',
                key: 'the_key',
                value:'some_value'
            });
        });
    }]));

    it("will store data in response to a 'set' message", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal) {
        // Exercise
        runs(function () {
            $window.postMessage({ command: 'set', key: 'the_key', value: 'the_value' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect($chromeStorageLocal.set).toHaveBeenCalledWith({ the_key : 'the_value' });

            expect($chromeStorageLocal.get).not.toHaveBeenCalled();
            expect($chromeStorageLocal.remove).not.toHaveBeenCalled();
        });
    }]));

    it("will delete data in response to a 'remove' message", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal
        ) {
        // Exercise
        runs(function () {
            $window.postMessage({ command: 'remove', key: 'the_key' }, "*");
        });
        // Verify
        waitsForMessage($window);
        runs(function () {
            expect($chromeStorageLocal.remove).toHaveBeenCalledWith('the_key');

            expect($chromeStorageLocal.get).not.toHaveBeenCalled();
            expect($chromeStorageLocal.set).not.toHaveBeenCalled();
        });
    }]));

    it("will stop handling messages once it has been destroyed", inject(['$window', '$chromeStorageLocal', 'clcChromeStorageServer', function($window, $chromeStorageLocal, storageServer) {
        // Exercise
        runs(function () {
            storageServer.destroy();
        });
        // Verify
        runs(function () {
            $window.postMessage({ command: "get", key: 'the_key' }, "*");
        });
        waitsForMessage($window);
        runs(function () {
            expect($chromeStorageLocal.get).not.toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Function));
        });
    }]));
});

describe("a Chrome application storage server message error scenarios", function() {

    var mockWindow;
    var mockStorage;
    var mockLog;

    beforeEach(function () {
        module(function($provide) {
            mockWindow = jasmine.createSpyObj('$window', ['addEventListener', 'removeEventListener']);
            mockStorage = jasmine.createSpyObj('$chromeStorageLocal', ['set', 'get', 'remove']);
            mockLog = jasmine.createSpyObj('$log', ['log', 'error']);

            $provide.value('clcIsChromeApp', true);
            $provide.value('$window', mockWindow);
            $provide.value('$chromeStorageLocal', mockStorage);
            $provide.value('$log', mockLog);
        });
    });

    beforeEach(inject(['clcChromeStorageServer', function(storageServer) {
        storageServer.init();
    }]));

    afterEach(inject(['clcChromeStorageServer', function(storageServer) {
        storageServer.destroy();
    }]));

    it("will post the message to the event origin if it exists", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal) {
        // Set up
        var mockEventSource = jasmine.createSpyObj('event source', ['postMessage']);
        var event = {
           data : {
               command : "get",
               key : "the_key"
           },
           source : mockEventSource,
           origin : 'chrome-extension://12345678'
        };
        $window.addEventListener.mostRecentCall.args[1](event);
        // Exercise
        $chromeStorageLocal.get.mostRecentCall.args[1]({ the_key : 'some_value' });
        // Verify
        expect(mockEventSource.postMessage).toHaveBeenCalledWith(jasmine.any(Object), 'chrome-extension://12345678');
    }]));

    it("will post the message to origin '*' if no event origin exists", inject(['$window', '$chromeStorageLocal', function($window, $chromeStorageLocal) {
        // Set up
        var mockEventSource = jasmine.createSpyObj('event source', ['postMessage']);
        var event = {
            data : {
                command : "get",
                key : "the_key"
            },
            source : mockEventSource,
            origin : null
        };
        $window.addEventListener.mostRecentCall.args[1](event);
        // Exercise
        $chromeStorageLocal.get.mostRecentCall.args[1]({ the_key : 'some_value' });
        // Verify
        expect(mockEventSource.postMessage).toHaveBeenCalledWith(jasmine.any(Object), '*');
    }]));

    it("will log errors occurring during data retrieval", inject(['$window', '$chromeStorageLocal', '$log', function($window, $chromeStorageLocal, $log) {
        // Set up
        var mockEventSource = jasmine.createSpyObj('event source', ['postMessage']);
        mockEventSource.postMessage.andCallFake(function() {
            throw 'Unable to post message exception';
        });
        var event = {
            data : {
                command : "get",
                key : "the_key"
            },
            source : mockEventSource
        };
        $window.addEventListener.mostRecentCall.args[1](event);
        // Exercise
        $chromeStorageLocal.get.mostRecentCall.args[1]({ the_key : 'some_value' });
        // Verify
        expect($log.error).toHaveBeenCalled();
    }]));
});


describe('obtaining a Chrome application storage server in non-Chrome application', function() {
    beforeEach(function () {
        module(function($provide) {
            $provide.value('clcIsChromeApp', false);
        });
    });

    it('will throw an error', inject(function($injector) {
        expect(function() { $injector.get('clcChromeStorageServer') }).toThrow();
    }));
});