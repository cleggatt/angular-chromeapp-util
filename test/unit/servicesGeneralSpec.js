beforeEach(module('cleggatt.chromeapp-util.general'));

describe('isChromeApp flag', function() {

    var mockWindow = {
        location : {
            protocol : ""
        }
    };

    beforeEach(function () {
        module(function($provide) {
            $provide.value('$window', mockWindow);
        });
    });

    var ensure = function($injector, protocol, expected) {
        // Set up
        mockWindow.location.protocol = protocol;
        // Exercise
        var result = $injector.get('clcIsChromeApp');
        // Verify
        expect(result).toBe(expected);
    }

    // TODO Use factory tests.
    // A syntax like "describe, with, it" would be nice i.e "Describe obtaining isChromeApp, with window.location 'http', it should be false
    it('is false for "http"', inject(function($injector) {
        // Set up
        mockWindow.location.protocol = 'http:';
        // Exercise
        var result = $injector.get('clcIsChromeApp');
        // Verify
        expect(result).toBe(false);
    }));

    it('is false for "https"', inject(function($injector) {
        // Set up
        mockWindow.location.protocol = 'https:';
        // Exercise
        var result = $injector.get('clcIsChromeApp');
        // Verify
        expect(result).toBe(false);
    }));

    it('is false for "file"', inject(function($injector) {
        // Set up
        mockWindow.location.protocol = 'file:';
        // Exercise
        var result = $injector.get('clcIsChromeApp');
        // Verify
        expect(result).toBe(false);
    }));

    it('is true for "chrome-extension"', inject(function($injector) {
        // Set up
        mockWindow.location.protocol = 'chrome-extension:';
        // Exercise
        var result = $injector.get('clcIsChromeApp');
        // Verify
        expect(result).toBe(true);
    }));
});