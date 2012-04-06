;(function(exports) {
	var module = {};

	module.EarthRadiusInMiles = 3956.0;

	module.EarthRadiusInKilometers = 6367.0;

	module.ToRadian = function(v) {
		return v * (Math.PI / 180);
	};

	module.DiffRadian = function(v1, v2) {
		return module.ToRadian(v2) - module.ToRadian(v1);
	};

	// TODO: Resolve with rnib-math.js and rnib-geo.js
	module.CalcDistance = function(lat1, lng1, lat2, lng2, radius) {
		return radius * 2 * Math.asin(Math.min(1, Math.sqrt((Math.pow(Math.sin((module.DiffRadian(lat1, lat2)) / 2.0), 2.0) + Math.cos(module.ToRadian(lat1)) * Math.cos(module.ToRadian(lat2)) * Math.pow(Math.sin((module.DiffRadian(lng1, lng2)) / 2.0), 2.0) ))));
	};

	module.toDegrees = function(r) {
		return r * (180 / Math.PI);
	};

	module.toCompass = function(degrees) {
		var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"];

		var index = degrees - 22.5;
		if(index < 0) {
			index += 360;
		}
		index = parseInt(index / 45, 10);

		return (bearings[index]);
	};

	module.toClock = function(degrees) {
		var correctedDegrees = degrees + 15;
		if (correctedDegrees >= 360) {
			correctedDegrees -= 360; // faster than modulo 360 above?
		}
		var clockNumber = Math.floor(correctedDegrees / 30);
		if (0 === clockNumber) {
			clockNumber = 12;
		}
		return clockNumber + " o'clock";
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.GeoCodeCalc = module;

})(window);
