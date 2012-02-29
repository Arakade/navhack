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
		var url = "http://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=json";
		// TODO: recordPending() + get handle from getJSON() call below
		$.getJSON(url, function(data) {
			log.log("jsonData: " + data);
			var displayName = data.display_name;
			log.info("displayName: " + data.display_name);
			var displayNameStart = displayName.split(",")[0];
			tts.speak(displayNameStart, ttsSuccess, ttsFailed);
			updater.recordReported(p, new Date()); // if recording last update manually
		}.bind(this), function(err) {
			log.error("jsonERR: " + err);
		}.bind(this));
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
