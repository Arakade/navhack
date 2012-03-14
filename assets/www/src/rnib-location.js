(function(exports, $, geo, GeoCodeCalc, log) {

	var module = {};
	var DEBUG = true;

	function initCoordData(nodeSrc) {
		var jqNode = $(nodeSrc);
		var lat = parseFloat(jqNode.attr("lat"));
		var lon = parseFloat(jqNode.attr("lon"));
		return new geo.GeoCoord(lat, lon);
	}

	/**
	 * @param src xml data reference.
	 * @param {Object} attributes Map of member data.
	 * @constructor
	 */
	module.Location = function Location(src, attributes) {
		var that = this;
		this.attributes = attributes;
		this.id = $(src).attr("id");
		var _ways = [];
		var namedWay = null;
		var coordData = null;
		var pois = null;

		this.__defineGetter__("coordinates", function() {
			if (!coordData) {
				coordData = initCoordData(src);
			}
			return coordData;
		});

		this.__defineGetter__("ownName", function() {
			return attributes.name;
		});

		/**
		 * Explicitly not a setter to prevent accidental assignment.
		 */
		this.addWay = function(newWay) {
			_ways.push(newWay);
		};

		this.__defineGetter__("ways", function() {
			return _ways;
		});

		this.hasPOIs = function() {
			return (null === this.pois);
		};

		// To use from logging.  MUST NOT call anything that logs!
		function internalToString(extraString) {
			var POIsString = " (" +
				(that.hasPOIs() ? this.pois.length : "no") +
				" POIs) ";
			return "Location(id:" + that.id + ", coordinates:" + that.coordinates + POIsString + extraString + ")";
		}

		function findANamedWay() {
			if (!that.ways) {
				if (DEBUG) {
					log.warn("No ways on " + internalToString(''));
				}
				return null;
			}
			var numWays = that.ways.length;
			for (var i = 0; i < numWays; i++) {
				var w = that.ways[i];
				if (w.name) {
					return w;
				}
			}
			return null;
		}

		this.__defineGetter__("aNamedWay", function() {
			if (!namedWay) {
				namedWay = findANamedWay();
			}
			return namedWay;
		});

		this.__defineGetter__("aName", function() {
			var name1 = that.ownName;
			if (name1) {
				return name1;
			}

			var aWay = that.aNamedWay;
			if (aWay) {
				return aWay.name;
			} else {
				return null;
			}
		});

		/**
		 * @constructor
		 */
		function POI(location) {
			this.location = location;

			/**
			 * Get range from containing Location.
			 * @type Number
			 */
			this.__defineGetter__("range", function() {
				var kilometers = that.coordinates.distanceTo(location.coordinates);
				return kilometers;
			});

			/**
			 * Get bearing in degrees from containing Location.
			 * @type Number
			 */
			this.__defineGetter__("bearing", function() {
				var retVal = that.coordinates.bearingTo(location.coordinates);
				return retVal;
			});

			/**
			 * Get bearing on clock face from containing Location (as an hour number).
			 * @type Number
			 */
			this.__defineGetter__("clockPoint", function() {
				var bearingDegrees = that.coordinates.bearingTo(location.coordinates);
				var bearingClock = GeoCodeCalc.toClock(bearingDegrees);
				return bearingClock;
			});

		}

		this.addLocationsAsPOIs = function(locationPOIs) {
			var newPOIs = [];
			for (var i = locationPOIs.length - 1; i >= 0; i--) {
				var l = locationPOIs[i];
				if (this !== l) {
					newPOIs.push(new POI(l));
				}
			}
			this.pois = newPOIs;
		};

		this.__defineGetter__("POIs", function() {
			return this.pois;
		});

		this.toString = function() {
			return internalToString(", name:" + that.aName);
		};
	};

	/**
	 * @param src xml data reference.
	 * @param {Object} attributes Map of member data.
	 * @constructor
	 */
	module.Way = function Way(src, attributes) {
		var that = this;
		var _locations = [];

		this.src = src;
		this.attributes = attributes;
		this.id = $(src).attr("id");

		this.__defineGetter__("name", function() {
			return attributes.name;
		});

		this.addLocation = function(l) {
			_locations.push(l);
		};

		this.__defineGetter__("locations", function() {
			return _locations;
		});

		this.toString = function() {
			return "Way(" + that.name + ")";
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = module;
})(this, jQuery, rnib.geo, rnib.GeoCodeCalc, rnib.log);
