;(function(exports, $, tts, log) {
	var module = {};

	function ttsSuccess(ret) {
		log.log("speech worked: " + ret);
	}

	function ttsFailed(ret) {
		log.error("speech failed: " + ret);
		alert("speech failed: " + ret);
	}

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
	exports.rnib.mockPositionner = module;
})(this, jQuery, rnib.tts, rnib.log);
