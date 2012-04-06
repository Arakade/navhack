;(function(exports, $, posPollerModule, MapDataModule, FindResultsModule, tts, geo, log) {
	var module = {};

	var MIN_REPORT_PERIOD = 10000,
		MIN_REPORT_DISTANCE = 0.05;

	function PerUpdate(locationProvider) {
		// var that = this;
		this.locationProvider = locationProvider;
		this.posPoller = null;
	}

	/**
	 * Return human-friendly form of kilometres.
	 */
	function sanitizeDistance(kilometers) {
		var metres = (1000 * kilometers).toFixed(0); // TODO: Allow human-friendly scale to scale depending on radius.
		return metres + " metres";
	}

	/**
	 * @param {FindResultsModule.FindResults} results The found results.
	 */
	function reportFindings(results) {
		var l = results.closestPOI.place;
		log.debug("closestPOI: " + l);
		var theName = l.theName;
		tts.speak("At " + theName);
		var allPOIs = results.POIs;
		var numPOIs = allPOIs.length;
		if (0 < numPOIs) {
			tts.speak("Nearby, there are " + numPOIs + " P.O.I's");
			for (var i = 0; i < numPOIs; i++) {
				var poi = allPOIs[i];
				var msg = "" + (1+i) + ". " + poi.place.theName + ", " + sanitizeDistance(poi.range) + " at " + poi.clockPoint;
				tts.speak(msg);
			}
		} else {
			tts.speak("Nearby, there are no P.O.I's");
		}
	}

	/**
	 * @param {GPSPos} p GPS position from periodic update.  Has coords.{latitude|longitude}.
	 * @param {posPollerModule.PosPoller} updater PosPoller to record update completion against.
	 */
	PerUpdate.method('retrieveAndReportLocation', function(p, updater) {
		var coords = new geo.GeoCoord(p.coords.latitude, p.coords.longitude);
		log.debug("retrieving " + coords);
		this.locationProvider.findNear(coords, function(results){
			updater.recordReported(p, new Date()); // if recording last update manually
			log.log("retrieveAndReportLocation: " + results);
			reportFindings(results);
		}, function(err){
			log.error("failed to get location: " + err);
		});
	});

	PerUpdate.method('startReporting', function() {
		this.posPoller = new posPollerModule.PosPoller();
		var callback = function(p, updater) {
			this.retrieveAndReportLocation(p, updater);
		}.bind(this);
		this.posPoller.setPosUpdateCallback(callback, false);
		this.posPoller.initPolling(MIN_REPORT_PERIOD, MIN_REPORT_DISTANCE);
	});

	PerUpdate.method('stopReporting', function() {
		if (!this.posPoller) {
			return;
		}
		this.posPoller.stopPolling();
	});

	module.PerUpdate = PerUpdate;

	exports.rnib = exports.rnib || {};
	exports.rnib.perUpdate = module;
})(this, jQuery, rnib.posPoller, rnib.mapData, rnib.location.FindResultsModule, rnib.tts, rnib.geo, rnib.log);
