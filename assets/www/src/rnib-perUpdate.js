;(function(exports, $, posPollerModule, tts, log) {
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

	function PerUpdate() {
		this.posPoller = null;
	}

	PerUpdate.method('retrieveAndReportLocation', function(p, updater) {
		var lat = p.coords.latitude;
		var lon = p.coords.longitude;
		// TODO: recordPending() + get handle from getJSON() call below
		try {
			var here = rnib.mapData.getNodeNearestLatLon(lat, lon);
			log.log("location: " + here);
			var aName = here.aName;
			tts.speak(aName, ttsSuccess, ttsFailed);
		} catch (err) {
			log.error("failed to get location: " + err);
		}
		updater.recordReported(p, new Date()); // if recording last update manually
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
})(this, jQuery, rnib.posPoller, rnib.tts, rnib.log);
