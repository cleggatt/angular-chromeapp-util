describe('isChromeApp flag', function() {

    var mockWindow = {
        location : {
            protocol : ''
        }
    };

    beforeEach(function () {
        module(function($provide) {
            $provide.provider('$window', function() {
                this.$get = function() {
                    return mockWindow;
                };
            });
        });
    });

    describe('when the window location protocol is "http"', function() {

        beforeEach(function () {
            mockWindow.location.protocol = 'http:';
            module('cleggatt.chromeapp-util.general');
        });

        it('should be false', inject(['clcIsChromeApp', function(isChromeApp) {
            expect(isChromeApp).toBe(false);
        }]));
    });

    describe('when the window location protocol is "https"', function() {

        beforeEach(function () {
            mockWindow.location.protocol = 'https:';
            module('cleggatt.chromeapp-util.general');
        });

        it('should be false', inject(['clcIsChromeApp', function(isChromeApp) {
            expect(isChromeApp).toBe(false);
        }]));
    });

    describe('when the window location protocol is "file"', function() {

        beforeEach(function () {
            mockWindow.location.protocol = 'file:';
            module('cleggatt.chromeapp-util.general');
        });

        it('should be false', inject(['clcIsChromeApp', function(isChromeApp) {
            expect(isChromeApp).toBe(false);
        }]));
    });

    describe('when the window location protocol is "chrome-extension', function() {

        beforeEach(function () {
            mockWindow.location.protocol = 'chrome-extension:';
            module('cleggatt.chromeapp-util.general');
        });

        it('should be true', inject(['clcIsChromeApp', function(isChromeApp) {
            expect(isChromeApp).toBe(true);
        }]));
    });
});