(function(exports, $, PlaceModule, POIModule, geo, GeoCodeCalc, log) {

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
		// Parent-required members
		this._addressUntested = true;
		this._addr = null;

		// Own vars
		var that = this;
		var _ways = [];
		var namedWay = null;
		var coordData = null;

		// Own members
		this.attributes = attributes;
		this.id = $(src).attr("id");

		/** @type geo.GeoCoord */
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
				if (w.theName) {
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
				return aWay.theName;
			} else {
				return null;
			}
		});

		// FIXME: Propagate change from "name" to "aName" or "theName"
		this.__defineGetter__("theName", function() {
			return this.aName;
		});

		/**
		 * Get a POI if this Location is within radius of the targetCoords; else return null.
		 * @param {geo.GeoCoord} targetCoords The centre point to check.
		 * @param {Number} radius The radius around the targetCoords.
		 * @type module.POI
		 */
		this.getPOIIfClose = function(targetCoords, radius) {
			var ds = this.coordinates.distanceTo(targetCoords);
			if (ds <= radius) {
				return new POIModule.POI(this, this, targetCoords);
			} else {
				return null;
			}
		};

		/**
		 * Returns true iff 'other' matches this Location.
		 */
		this.equals = function(other) {
			return this.id === other.id;
		};

		this.toString = function() {
			return internalToString(", name:" + that.aName);
		};
	};
	module.Location.prototype = new PlaceModule.Place();

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.LocationModule = module;
})(this, jQuery, rnib.location.PlaceModule, rnib.location.POIModule, rnib.geo, rnib.GeoCodeCalc, rnib.log);
