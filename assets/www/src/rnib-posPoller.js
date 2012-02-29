;(function(exports, GeoCodeCalc, log) {
	var module = {};

	function ttsSuccess(ret) {
		log.log("speech worked: " + ret);
	}

	function ttsFailed(ret) {
		log.error("speech failed: " + ret);
		alert("speech failed: " + ret);
	}

	function PosPoller() {
		this.prevLat = 0;
		this.prevLon = 0;
		this.lastSpoke = new Date(0);
		this.watchId = null;
		this.onPosUpdateCallback = null;
		this.autoRecordLast = true;
		this.pendingRecordReported = null;
		this.minReportPeriod = 10000; // TODO: Un-caps
		this.minReportDistance = 0.05;
	}

	PosPoller.method('recordReported', function (p, when) {
		this.pendingRecordReported = null;
		this.prevLat = p.coords.latitude;
		this.prevLon = p.coords.longitude;
		this.lastSpoke = when;
		log.log("Last update at " + this.lastSpoke + " at " + this.prevLat + ", " + this.prevLon);
	});

	/**
	 * Records last update sent to client to detect if client is not calling recordReported() appropriately.
	 */
	PosPoller.method('recordPending', function (p, when) {
		if (this.pendingRecordReported) {
			log.warn("pendingRecordReported since " + this.pendingRecordReported);
		}
		this.pendingRecordReported = when;
	});

	// (exposed for unit testing)
	PosPoller.method('farAndLongEnough', function(p, when) {
		var lat = p.coords.latitude;
		var lon = p.coords.longitude;
		var deltaT = when - this.lastSpoke;
		log.log("gotGps: lat:" + lat + ", lon:" + lon + " at deltaT:" + deltaT);

		// If >10secs has elapsed since the last speech:
		if(deltaT >= this.minReportPeriod) {
			var distance = GeoCodeCalc.CalcDistance(this.prevLat, this.prevLon, lat, lon, GeoCodeCalc.EarthRadiusInMiles);
			log.log("distance: " + distance);
			if(distance >= this.minReportDistance) {
				return true;
			} else {
				log.info("not moved far enough");
				return false;
			}
		} else {
			log.info("not been long enough");
			return false;
		}
	});

	PosPoller.method('gotGps', function (p) {
		var when = new Date(); // (p.timestamp);
		if (this.farAndLongEnough(p, when)) {
			this.recordPending(p, when);
			this.onPosUpdateCallback(p, this);
			if (this.autoRecordLast) {
				this.recordReported(p, new Date());
			}
		}
	});

	PosPoller.method('gpsError', function (ex) {
		// TODO: improve gpsError() response -- Switch on ex.code (like suggesting enabling GPS)
		var msg = ex.message;
		log.error(msg);
		alert("location failed: " + msg);
	});

	PosPoller.method('stopPolling', function() {
		if (this.watchId) {
			log.info("Clearing watchId " + this.watchId);
			navigator.geolocation.clearWatch(this.watchId);
			this.watchId = null;
		}
	});

	/**
	 * @param newPosUpdateCallback Function(gpsPos, posPoller) that will be called each update.  PosPoller is to call recordReported if not autoRecordLast.
	 * @param autoRecordLast Whether to automatically record last position time and location.  If false, user must call recordReported(p, when) themselves.
	 */
	PosPoller.method('setPosUpdateCallback', function(newPosUpdateCallback, autoRecordLast) {
		if (!newPosUpdateCallback) {
			throw new Error("null position update callback supplied");
		}
		this.onPosUpdateCallback = newPosUpdateCallback;
		this.autoRecordLast = autoRecordLast;
	});

	PosPoller.method('initPolling', function(minReportPeriod, minReportDistance) {
		if (!this.onPosUpdateCallback) {
			throw new Error("no position update callback set");
		}
		this.minReportPeriod = minReportPeriod;
		this.minReportDistance = minReportDistance;
		var gpsOptions = {
			enableHighAccuracy:true,
			frequency:minReportPeriod,
			maximumAge:minReportPeriod
		};
		var successClosure = function(p) {
			this.gotGps(p);
		}.bind(this);
		var errorClosure = function(p) {
			this.gpsError(p);
		}.bind(this);
		this.stopPolling(); // just in case, stop 2+ polls
		this.watchId = navigator.geolocation.watchPosition(successClosure, errorClosure, gpsOptions);
	});

	module.PosPoller = PosPoller;

	exports.rnib = exports.rnib || {};
	exports.rnib.posPoller = module;
})(this, rnib.GeoCodeCalc, rnib.log);
