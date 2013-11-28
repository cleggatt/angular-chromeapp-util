jasmine.Spec.prototype.tbd = function () {
    this.fail("Unimplemented specification");
};

var waitsForMessage = function(window) {

    var flag = false;
    var listener = function(event) {
        flag = true
    };

    runs(function() {
        flag = false;
        window.addEventListener('message', listener);
    });
    waitsFor(function() {
        return flag;
    }, "Message should be received", 500);
    runs(function() {
        window.removeEventListener('message', listener);
    });
};

beforeEach(function() {
    this.addMatchers({
        toBeEmpty : function() {
            return (this.actual instanceof Array) && (this.actual.length == 0);
        }
    });
});