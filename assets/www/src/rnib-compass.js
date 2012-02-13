// Module to abstract navigation across all platforms.
(function(exports, $, undefined){

    var that = this;
    var module = {};

    var compassCallback;
    var watchID = null;

    module.registerCompassCallback = function(compassCallback) {
    	this.compassCallback = compassCallback;
    }

    module.toggleCompass = function() {
        if (watchID !== null) {
            navigator.compass.clearWatch(watchID);
            watchID = null;
            updateHeading({ magneticHeading : "Off"});
        } else {
            var options = { frequency: 1000 };
            watchID = navigator.compass.watchHeading(updateHeading, function(e) {
                alert('Compass Error: ' + e.code);
            }, options);
        }
    }

    function updateHeading(h) {
        compassCallback(h.magneticHeading);
    }

    exports.rnib = exports.rnib || {};

    exports.rnib.compass = module;
})(window, jQuery)