;(function(exports, mapData) {
	var module = {};

	module.PointsOfInterestFinder = function() {

		this.getPointsOfInterest = function(location, radiusOfInterest, callback) {
			var results = [];
			results.push(new module.PointOfInterest(new rnib.geo.GeoCoord(12.10101, 78.565), "some location"));
			callback.call(this, results);
		};

		this.getCurrentLocation = function(location) {
			return "Goswell Road";
		};
	};

	module.PointOfInterest = function(coordinate, name) {
		this.coord = coordinate;
		this.name = name;
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.poi = module;
})(this, rnib.mapData);
