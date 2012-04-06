;(function(exports, GeoCodeCalc, LocationModule, PlaceModule, GeoModule, log) {
	var module = {};
	var DEBUG = true;

	/**
	 * A point of interest that is distant from a supplied point.
	 * NO NOT INSTANTIATE -- exposed solely for type checking.
	 * @param {rnib.location.PlaceModule.Place} place The feature that is the point of interest.
	 * @param {rnib.location.LocationModule.Location} closestLocation Location of the POI (perhaps sub-point within Way).
	 * @param {rnib.geo.GeoCoord} fromCoords Coords from which the POI is distant.
	 * @constructor
	 */
	module.POI = function POI(place, closestLocation, fromCoords) {
		if (!place || !closestLocation || !fromCoords) {
			throw new Error("Must supply place, closestLocation and fromCoords.  Got (" + place + ", " +  closestLocation + ", " + fromCoords + ")");
		}

		if (DEBUG) {
			// TODO: Fix cyclic dependency between POIModule and LocationModule which blocks type-checking Location argument
			if (!(place instanceof PlaceModule.Place) /* || !(closestLocation instanceof LocationModule.Location) */ || !(fromCoords instanceof GeoModule.GeoCoord)) {
				throw new Error("Incorrect type(s) place:Place, closestLocation:Location and fromCoords:GeoCoord.  Got (" + place + ", " +  closestLocation + ", " + fromCoords + ")");
			}
		}

		/** @type rnib.location.PlaceModule.Place */
		this.place = place;

		/** @type rnib.location.Location */
		this.closestLocation = closestLocation;

		/**
		 * Get range from point.
		 * @type Number
		 */
		this.__defineGetter__("range", function() {
			var kilometers = closestLocation.coordinates.distanceTo(fromCoords);
			return kilometers;
		});

		/**
		 * Get bearing in degrees from point "fromCoords" to the "closestLocation".
		 * @type Number
		 */
		this.__defineGetter__("bearing", function() {
			var retVal = fromCoords.bearingTo(closestLocation.coordinates);
			return retVal;
		});

		/**
		 * Get bearing on clock face from point (as an hour number).
		 * @type String
		 */
		this.__defineGetter__("clockPoint", function() {
			var bearingDegrees = fromCoords.bearingTo(closestLocation.coordinates);
			var bearingClock = GeoCodeCalc.toClock(bearingDegrees);
			return bearingClock;
		});

		/**
		 * Return true iff the place of 'otherPOI' matches this POI's place.
		 * @param {POI} otherPOI POI to test.
		 * @type boolean
		 */
		this.poiPlaceMatches = function(otherPOI) {
			return (place.equals(otherPOI.place));
		};

		this.toString = function() {
			return "POI(near:" + fromCoords + ", closestLocation:" + closestLocation + " @ range:" + this.range + ", bearing:" + this.bearing + " is place:" + place + ")";
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.POIModule = module;
})(this, rnib.GeoCodeCalc, rnib.location.LocationModule, rnib.location.PlaceModule, rnib.geo, rnib.log);
