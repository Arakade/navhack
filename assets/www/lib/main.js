var lat = 0,
	lon = 0,
	prevLat = 0,
	prevLon = 0,
	address = 0,
	lastSpoke = new Date();
var latitudes, longitudes, lli;

var saidHi = false;

var deviceInfo = function() {
	var ttsLoaded = function(ret) {
		// alert("tts loaded: "+ ret);
		sayHi();
	}

	var ttsLoadFailed = function(ret) {
		alert("tts failed: "+ ret);
	}

	window.plugins.tts.startup(ttsLoaded, ttsLoadFailed);

var gpsOptions = { enableHighAccuracy:true};
//navigator.geolocation.watchPosition(gotGps, gpsError, gpsOptions);
latitudes=new Array();
longitudes=new Array();
lli=0;
latitudes.push(52); longitudes.push(0);
latitudes.push(52.1); longitudes.push(0.1);
latitudes.push(52.2); longitudes.push(0.2);

$("#MainPage").on("tap", onTap);
};

var getLocation = function() {
    var suc = function(p) {
        alert(p.coords.latitude + " " + p.coords.longitude);
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

function roundNumber(num) {
    var dec = 3;
    var result = Math.round(num * Math.pow(10, dec)) / Math.pow(10, dec);
    return result;
}

var accelerationWatch = null;

function updateAcceleration(a) {
    document.getElementById('x').innerHTML = roundNumber(a.x);
    document.getElementById('y').innerHTML = roundNumber(a.y);
    document.getElementById('z').innerHTML = roundNumber(a.z);
}

var toggleAccel = function() {
    if (accelerationWatch !== null) {
        navigator.accelerometer.clearWatch(accelerationWatch);
        updateAcceleration({
            x : "",
            y : "",
            z : ""
        });
        accelerationWatch = null;
    } else {
        var options = {};
        options.frequency = 1000;
        accelerationWatch = navigator.accelerometer.watchAcceleration(
                updateAcceleration, function(ex) {
                    alert("accel fail (" + ex.name + ": " + ex.message + ")");
                }, options);
    }
};

var preventBehavior = function(e) {
    e.preventDefault();
};

function dump_pic(data) {
    var viewport = document.getElementById('viewport');
    console.log("setting "+ viewport +", with :"+ data);
    viewport.style.display = "";
    viewport.style.position = "absolute";
    viewport.style.top = "10px";
    viewport.style.left = "10px";
    document.getElementById("test_img").src = "data:image/jpeg;base64," + data;
}

function fail(msg) {
    alert(msg);
}

function show_pic() {
    navigator.camera.getPicture(dump_pic, fail, {
        quality : 50
    });
}

function close() {
    var viewport = document.getElementById('viewport');
    viewport.style.position = "relative";
    viewport.style.display = "none";
}

function contacts_success(contacts) {
    alert(contacts.length
            + ' contacts returned.'
            + (contacts[2] && contacts[2].name ? (' Third contact is ' + contacts[2].name.formatted)
                    : ''));
}

function get_contacts() {
    var obj = new ContactFindOptions();
    obj.filter = "";
    obj.multiple = true;
    navigator.contacts.find(
            [ "displayName", "name" ], contacts_success,
            fail, obj);
}

function check_network() {
    var networkState = navigator.network.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.NONE]     = 'No network connection';

    confirm('Connection type:\n ' + states[networkState]);
}

var watchID = null;

function updateHeading(h) {
    document.getElementById('h').innerHTML = h.magneticHeading;
}

function toggleCompass() {
    if (watchID !== null) {
        navigator.compass.clearWatch(watchID);
        watchID = null;
        updateHeading({ magneticHeading : "Off"});
    } else {
        var options = { frequency: 1000 };
        watchID = navigator.compass.watchHeading(updateHeading, function(e) {
            alert('Compass Error: ' + e.code);
        }, options);
    }
}

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
	window.plugins.tts.speak("Hello to all at the Londroid R N I B Hack-a-thon", ttsSuccess, ttsFailed);
	saidHi = true;
}

function init() {
    // the next line makes it impossible to see Contacts on the HTC Evo since it
    // doesn't have a scroll button
    // document.addEventListener("touchmove", preventBehavior, false);
    document.addEventListener("deviceready", deviceInfo, true);
    console.log("init done");
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
				window.plugins.tts.speak(display_name, ttsSuccess, ttsFailed);
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
	window.plugins.tts.speak("At end of route", ttsSuccess, ttsFailed);
} else {
var latitude = latitudes[lli];
var longitude = lli[longitudes];
lli++;
			var url = "http://nominatim.openstreetmap.org/reverse?lat="+latitude+"&lon="+longitude+"&format=json";
			$.getJSON(url, function(data) {
				var displayName = data.display_name;
				window.plugins.tts.speak(displayName, ttsSuccess, ttsFailed);
			});
}
}
