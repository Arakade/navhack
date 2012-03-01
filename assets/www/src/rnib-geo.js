;(function(exports) {
	var module = {};

	// TODO: Switch rnib-geo to using GeoCodeCalc methods (better spherical mathematics) for bearing and distance.
	module.GeoCoord = function(latitude, longitude) {
		this.lat = latitude;
		this.lon = longitude;

		this.bearingTo = function(other) {
			var lat1 = this.lat,
				lon1 = this.lon,
				lat2 = other.lat,
				lon2 = other.lon,
				dLon, x, y, bearing;

			lat1 = lat1 * Math.PI / 180;
			lat2 = lat2 * Math.PI / 180;
			dLon = (lon2 - lon1) * Math.PI / 180;
			y = Math.sin(dLon) * Math.cos(lat2);
			x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
			bearing = Math.atan2(y, x) * 180 / Math.PI;
			if (bearing < 0) {
				bearing = bearing + 360;
			}

			return bearing;
		};

		this.distanceTo = function(other) {
			var earthRadius = 6371; // km

			var lat1 = this.lat * Math.PI / 180,
				lat2 = other.lat * Math.PI / 180,
				dLon = (other.lon - this.lon) * Math.PI / 180,
				dLat = lat2 - lat1;

			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
					Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

			return earthRadius * c;
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.geo = module;
})(this);
