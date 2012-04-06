;(function(exports, POIModule, log) {
	var module = {};
	var DEBUG = true;

	/**
	 * Return a copy of 'list' without 'theOne'.
	 * @param {POIModule.POI[]} list List to search.
	 * @param {POIModule.POI} theOne One to find.
	 */
	function removeOne(list, theOne) {
		function findTheOne() {
			for (var i = list.length - 1; i >= 0; i--) {
				if (theOne.poiPlaceMatches(list[i])) {
					return i;
				}
			}
			return -1;
		}
		// Find the one
		var i = findTheOne(); // cannot use list.indexOf(theOne) since it uses identity matching
		if (-1 == i) {
			log.warn("removeOne: didn't find '" + theOne + "' in list " + list);
			return list;
		}

		// slice before and after into new array
		var p1 = (0 === i) ? [] : list.slice(0, i);
		var p2 = list.slice(i + 1);
		// concat 2 arrays
		p1.push.apply(p1, p2);
		return p1;
	}

	/**
	 * DO NOT INSTANTIATE directly.  This type is only exposed for type validation.
	 * @constructor
	 * @param {POIModule.POI} closestPOI Nearest Point of interest.
	 * @param {POIModule.POI[]} POIs All other nearby points of interest (excluding closestPOI).
	 */
	module.FindResults = function FindResults(closestPOI, POIs) {
		if (!closestPOI || !POIs) {
			throw new Error("Must supply closestPOI and POIs.  Got (closestPOI:" + closestPOI + ", POIs:" +  POIs + ")");
		}

		if (DEBUG) {
			if (!(closestPOI instanceof POIModule.POI) || !(POIs instanceof Array)) {
				throw new Error("Incorrect type(s) closestPOI:POI, POIs:POI[].  Got (closestPOI:" + closestPOI.constructor.name + ", POIs:" + POIs.constructor.name + ")");
			}

			for (var i = POIs.length - 1; i >= 0; i--) {
				if (!(POIs[i] instanceof POIModule.POI)) {
					throw new Error("Incorrect POIs array type.  POI[" + i + "]:" + POIs[i].constructor.name + " (checking backwards)");
				}
			}
		}

		/** @type POIModule.POI */
		this.closestPOI = closestPOI;

		/** @type POIModule.POI[] */
		this.POIs = removeOne(POIs, closestPOI);
	};
	module.FindResults.method("toString", function() {
		return "Found(closestPOI:" + this.closestPOI + ", POIs:" + this.POIs + ")";
	});

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.FindResultsModule = module;
})(this, rnib.location.POIModule, rnib.log);
