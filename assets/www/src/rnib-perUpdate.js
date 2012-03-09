;(function(exports, $, posPollerModule, tts, geo, log) {
	var module = {};

	var MIN_REPORT_PERIOD = 10000,
		MIN_REPORT_DISTANCE = 0.05;

	function ttsSuccess(ret) {
		log.log("speech worked: " + ret);
	}

	function ttsFailed(ret) {
		log.error("speech failed: " + ret);
		alert("speech failed: " + ret);
	}

	function PerUpdate(locationProvider) {
		// var that = this;
		this.locationProvider = locationProvider;
		this.posPoller = null;
	}

	PerUpdate.method('retrieveAndReportLocation', function(p, updater) {
		var coords = new geo.GeoCoord(p.coords.latitude, p.coords.longitude);
		log.debug("retrieving " + coords);
		this.locationProvider.findPlaceNear(coords, function(l){
			log.log("location: " + l);
			var aName = l.aName;
			tts.speak(aName, ttsSuccess, ttsFailed);
			updater.recordReported(p, new Date()); // if recording last update manually
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
