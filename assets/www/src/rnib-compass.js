// Module to abstract navigation across all platforms.
;(function(exports, $) {

	var module = {};

	var compassCallback;
	var watchID = null;

	function updateHeading(h) {
		compassCallback(h.magneticHeading);
	}


	module.registerCompassCallback = function(newCallback) {
		this.compassCallback = newCallback;
	};

	module.toggleCompass = function() {
		if (watchID !== null) {
			navigator.compass.clearWatch(watchID);
			watchID = null;
			updateHeading({
				magneticHeading : "Off"
			});
		} else {
			var options = {
				frequency : 1000
			};
			watchID = navigator.compass.watchHeading(updateHeading, function(e) {
				alert('Compass Error: ' + e.code);
			}, options);
		}
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.compass = module;
})(window, jQuery);
