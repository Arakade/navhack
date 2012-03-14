;(function(exports, $, posPollerModule, tts, geo, log) {
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
	 * @param {rnib.geo.Location} l The found Location.
	 */
	function reportFindings(l) {
		var aName = l.aName;
		tts.speak(aName);
		var allPOIs = l.POIs;
		for (var i = allPOIs.length - 1; i >= 0; i--) {
			var poi = allPOIs[i];
			var msg = poi.location.aName + ", " + sanitizeDistance(poi.range) + " at " + poi.clockPoint ;
			tts.speak(msg);
		}
	}

	PerUpdate.method('retrieveAndReportLocation', function(p, updater) {
		var coords = new geo.GeoCoord(p.coords.latitude, p.coords.longitude);
		log.debug("retrieving " + coords);
		this.locationProvider.findPlaceNear(coords, function(l){
			updater.recordReported(p, new Date()); // if recording last update manually
			log.log("location: " + l);
			reportFindings(l);
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
})(this, jQuery, rnib.posPoller, rnib.tts, rnib.geo, rnib.log);
