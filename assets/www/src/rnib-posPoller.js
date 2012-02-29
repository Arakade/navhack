;(function(exports, $, tts, GeoCodeCalc, log) {
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

	function PosPoller() {
		this.prevLat = 0;
		this.prevLon = 0;
		this.lastSpoke = new Date(0);
	}

	PosPoller.method('recordReported', function (when) {
		this.lastSpoke = when;
		log.log("Last spoke at " + this.lastSpoke);
	});

	PosPoller.method('recordPending', function (jsonRequestHandle) {
		// FIXME: Implement recordPending to record pending JSON query.
		// TODO: Record JSON callback handle and cancel on new position?
	});

	// (exposed for unit testing)
	PosPoller.method('farAndLongEnough', function(p, when) {
		var lat = p.coords.latitude;
		var lon = p.coords.longitude;
		var deltaT = when - this.lastSpoke;
		log.log("gotGps: lat:" + lat + ", lon:" + lon + " at deltaT:" + deltaT);

		// If >10secs has elapsed since the last speech:
		if(deltaT >= MIN_REPORT_PERIOD) {
			var distance = GeoCodeCalc.CalcDistance(this.prevLat, this.prevLon, lat, lon, GeoCodeCalc.EarthRadiusInMiles);
			log.log("distance: " + distance);
			if(distance >= MIN_REPORT_DISTANCE) {
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

	PosPoller.method('retrieveAndReportLocation', function (p) {
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
			this.prevLat = lat;
			this.prevLon = lon;
			this.recordReported(new Date());
		}.bind(this), function(err) {
			log.error("jsonERR: " + err);
		}.bind(this));
	});

	PosPoller.method('gotGps', function (p) {
		var when = new Date(); // (p.timestamp);
		if (this.farAndLongEnough(p, when)) {
			this.retrieveAndReportLocation(p);
		}
	});

	PosPoller.method('gpsError', function (ex) {
		// TODO: improve gpsError() response -- Switch on ex.code (like suggesting enabling GPS)
		var msg = ex.message;
		log.error(msg);
		alert("location failed: " + msg);
	});

	PosPoller.method('initPolling', function() {
		var gpsOptions = {
			enableHighAccuracy:true,
			frequency:MIN_REPORT_PERIOD,
			maximumAge:MIN_REPORT_PERIOD
		};
		var successClosure = function(p) {
			this.gotGps(p);
		}.bind(this);
		var errorClosure = function(p) {
			this.gpsError(p);
		}.bind(this);
		navigator.geolocation.watchPosition(successClosure, errorClosure, gpsOptions);
	});

	module.PosPoller = PosPoller;

	module.MockPositionner = function() {
		var latitudes = [],
			longitudes = [],
			lli = 0;

		function setupMockGPSData() {
			var lat0 = 51.52454555500299;
			var lon0 = -0.09877452626824379;
			var step = 0.0001;
			for(var i = 0; i <= 20; i++) {
				latitudes.push(lat0);
				longitudes.push(lon0);
				lat0 += step;
			}

			// Disabled manual steps to ease testing.
			// latitudes.push(51.5241521); longitudes.push(-0.0989377);
			// latitudes.push(51.5241982); longitudes.push(-0.0989615);
			// latitudes.push(51.5242067); longitudes.push(-0.0989370);
			// latitudes.push(51.5242152); longitudes.push(-0.0986890);
			// latitudes.push(51.5242532); longitudes.push(-0.0987932);
			// latitudes.push(51.5242601); longitudes.push(-0.0987955);
			// latitudes.push(51.5242765); longitudes.push(-0.0987343);
			// latitudes.push(51.5259560); longitudes.push(-0.0997050);
			// latitudes.push(51.5259873); longitudes.push(-0.0995799);
			// latitudes.push(51.5259954); longitudes.push(-0.0995397);
			// latitudes.push(51.5260003); longitudes.push(-0.0997208);
			// latitudes.push(51.5260271); longitudes.push(-0.0995512);
		}

		/** Temp method for testing mock GPS route on tap. */
		this.onTap_TMP = function(e) {
			// Lazy initialize the mock data
			if (0 === latitudes.length) {
				setupMockGPSData();
			}

			if(lli >= latitudes.length) {
				tts.speak("At end of route", ttsSuccess, ttsFailed);
			} else {
				var lat = latitudes[lli];
				var lon = longitudes[lli];
				log.log("lli:" + lli + ", lon:" + lon + ", lat:" + lat);
				lli++;
				var url = "http://nominatim.openstreetmap.org/reverse?lat=" + lat + "&lon=" + lon + "&format=json";
				$.getJSON(url, function(data) {
					var displayName = data.display_name;
					log.log("displayName: " + data.display_name);
					var displayNameStart = displayName.split(",")[0];
					tts.speak(displayNameStart, ttsSuccess, ttsFailed);
				});
			}
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.posPoller = module;
})(this, jQuery, rnib.tts, rnib.GeoCodeCalc, rnib.log);
