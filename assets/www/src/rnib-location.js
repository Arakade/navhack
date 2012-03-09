(function(exports, $, geo, log) {

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

		// To use from logging.  MUST NOT call anything that logs!
		function internalToString(extraString) {
			return "Location(id:" + that.id + ", coordinates:" + that.coordinates + extraString + ")";
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
})(this, jQuery, rnib.geo, rnib.log);
