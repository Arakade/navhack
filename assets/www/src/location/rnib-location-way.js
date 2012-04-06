(function(exports, $, PlaceModule, POIModule, geo, GeoCodeCalc, log) {

	var module = {};

	/**
	 * @param {location.Place} list List of Places.
	 * @param {geo.GeoCoord} targetCoords Where to search for.
	 * @param {Number} radius Radius to search for items within.
	 * @type module.Place
	 */
	function findClosestWithinRadius(list, targetCoords, radius) {
		var d = 9999999999999;
		var closestElement = null;
		for (var i = list.length - 1; i >= 0; i--) {
			var n = list[i];
			var ds = n.coordinates.distanceTo(targetCoords);
			if (ds < radius && ds < d) {
				d = ds;
				closestElement = n;
			}
		}
		return closestElement;
	}

	/**
	 * @param src xml data reference.
	 * @param {Object} attributes Map of member data.
	 * @constructor
	 */
	module.Way = function Way(src, attributes) {
		// Parent-required members
		this._addressUntested = true;
		this._addr = null;

		// Own vars
		var that = this;
		var _locations = [];

		// Own members
		this.src = src;
		this.attributes = attributes;
		this.id = $(src).attr("id");

		this.__defineGetter__("theName", function() {
			return attributes.name;
		});

		this.addLocation = function(l) {
			_locations.push(l);
		};

		this.__defineGetter__("locations", function() {
			return _locations;
		});

		/**
		 * Get a POI if this Way has a point within radius of the targetCoords; else return null.
		 * @param {geo.GeoCoord} targetCoords Where to search for.
		 * @param {Number} radius Radius to search for items within.
		 * @type module.POI
		 */
		this.getPOIIfClose = function(targetCoords, radius) {
			var pointOrNull = findClosestWithinRadius(that.locations, targetCoords, radius);
			if (!pointOrNull) {
				return null;
			}

			return new POIModule.POI(that, pointOrNull, targetCoords);
		};

		/**
		 * Returns true iff 'other' matches this Location.
		 */
		this.equals = function(other) {
			return this.id === other.id;
		};

		this.toString = function() {
			return "Way(" + that.theName + ")";
		};
	};
	module.Way.prototype = new PlaceModule.Place();

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.WayModule = module;
})(this, jQuery, rnib.location.PlaceModule, rnib.location.POIModule, rnib.geo, rnib.GeoCodeCalc, rnib.log);
