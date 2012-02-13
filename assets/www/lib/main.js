var notDeviceTimer;
var lat = 0,
	lon = 0,
	prevLat = 0,
	prevLon = 0,
	address = 0,
	lastSpoke = new Date();
var latitudes, longitudes, lli;

var saidHi = false;

function onNotDevice() {
	console.log("onNotDevice: calling onDeviceReady regardless for testing");
	onDeviceReady();
}

var onDeviceReady = function() {
	console.log("onDeviceReady");
	clearTimeout(notDeviceTimer);

	initSpeech();
	initGPS();
	initControls();
};

function initSpeech() {
	var ttsLoaded = function(ret) {
		sayHi();
	}

	var ttsLoadFailed = function(ret) {
		alert("tts failed: "+ ret);
	}

	rnib.tts.init(ttsLoaded, ttsLoadFailed);
}

function initGPS() {
	var gpsOptions = { enableHighAccuracy:true};
	//navigator.geolocation.watchPosition(gotGps, gpsError, gpsOptions);
	latitudes=new Array();
	longitudes=new Array();
	lli=0;

	var lat0 = 51.52454555500299;
	var lon0 = -0.09877452626824379
	var step = 1e-4;
	for (var i = 0; i <= 20; i++) {
		latitudes.push(lat0); longitudes.push(lon0);
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

function initControls() {
	$("#MainPage").on("tap", onTap);
}

var getLocation = function() {
    var suc = function(p) {
        console.log(p.coords.latitude + ", " + p.coords.longitude)
    };
    var locFail = function(ex) {
    	alert("location failed: "+ ex);
    };
    navigator.geolocation.getCurrentPosition(suc, locFail);
};

var beep = function() {
    navigator.notification.beep(2);
};

var vibrate = function() {
    navigator.notification.vibrate(0);
};

var preventBehavior = function(e) {
    e.preventDefault();
};

var ttsSuccess = function(ret) {
	console.log("speech worked: "+ ret);
}

var ttsFailed = function(ret) {
	console.log("speech failed: "+ ret);
	alert("speech failed: "+ ret);
}

function sayHi() {
	if (saidHi) {
		return;
	}
	rnib.tts.speak("Hello to all at the Londroid R N I B Hack-a-thon", ttsSuccess, ttsFailed);
	saidHi = true;
}

function init() {
	prepForNotDevice();
    // the next line makes it impossible to see Contacts on the HTC Evo since it
    // doesn't have a scroll button
    // document.addEventListener("touchmove", preventBehavior, false);
    document.addEventListener("deviceready", onDeviceReady, true);
    console.log("init done -- awaiting onDeviceReady");
}

// Set timeout for this not being device to allow testing on webpage
// TODO: Find better way to do this.
function prepForNotDevice() {
	console.log("prepForNotDevice");
	notDeviceTimer = setTimeout(onNotDevice, 3000);
}

function gpsError(ex) {
    alert("location failed: "+ ex);
}

function gotGps(p) {
	console.log("gotGps: "+ p);
	prevLat = 0;
	prevLon = 0;
	lat=p.coords.latitude;
	lon=p.coords.longitude;
	var gpsTime = new Date(p.timestamp);

	// If >10secs has elapsed since the last speech:
	var deltaT = gpsTime - lastSpoke;
	console.log("gpsTime: "+ gpsTime +", deltaT: "+ deltaT);
	if (deltaT >= 10000) {
		var distance = GeoCodeCalc.CalcDistance(prevLat, prevLon, lat, lon, GeoCodeCalc.EarthRadiusInMiles);
		console.log("distance: "+ distance);
		if (distance > 0.05) {
			var url = "http://nominatim.openstreetmap.org/reverse?lat="+lat+"&lon="+lon+"&format=json";
			$.getJSON(url, function(data) {
				console.log("jsonData: "+ data);
				var displayName = data.display_name;
				console.log("displayName: "+ data.display_name);
				var displayNameStart = displayName; // .split(",")[0];
				rnib.tts.speak(displayNameStart, ttsSuccess, ttsFailed);
				prevLat = lat;
				prevLon = lon;
				lastSpoke = gpsTime;
				alert(data);
			}, function(err) {
				console.log("jsonFail: "+ err);
			});
			lastSpoke = gpsTime;
			console.log("queried at "+ gpsTime);
		} else {
			console.log("not moved far enough");
		}
	} else {
		console.log("not been long enough");
	}
}

function onTap(e) {
	if (lli >= latitudes.length){
		rnib.tts.speak("At end of route", ttsSuccess, ttsFailed);
	} else {
		var latitude = latitudes[lli];
		var longitude = longitudes[lli];
		console.log("lli:"+ lli +", lon:"+ longitude +", lat:"+ latitude)
		lli++;
		var url = "http://nominatim.openstreetmap.org/reverse?lat="+latitude+"&lon="+longitude+"&format=json";
		$.getJSON(url, function(data) {
			var displayName = data.display_name;
			console.log("displayName: "+ data.display_name);
			var displayNameStart = displayName; // .split(",")[0];
			rnib.tts.speak(displayNameStart, ttsSuccess, ttsFailed);
		});
	}
}
