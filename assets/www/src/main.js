;(function(exports, $, tts, log, perUpdateModule, mockPositionnerModule) {

	var module = {};

	var perUpdate,
		mockPositionner = null;
	var notDeviceTimer = null;
	var saidHi = false;

	function ttsSuccess(ret) {
		log("speech worked: " + ret);
	}

	function ttsFailed(ret) {
		log("speech failed: " + ret);
		alert("speech failed: " + ret);
	}

	function sayHi() {
		if(saidHi) {
			return;
		}
		tts.speak("Hello to all at the Londroid R N I B Hack-a-thon", ttsSuccess, ttsFailed);
		saidHi = true;
	}

	function initSpeech() {
		var ttsLoaded = function(ret) {
			sayHi();
		};
		var ttsLoadFailed = function(ret) {
			alert("tts failed: " + ret);
		};

		tts.init(ttsLoaded, ttsLoadFailed);
	}

	function beep() {
		navigator.notification.beep(2);
	}

	function vibrate() {
		navigator.notification.vibrate(0);
	}

	function preventBehavior(e) {
		e.preventDefault();
	}

	function initControls() {
		$("#MainPage").on("tap", mockPositionner.onTap_TMP);
	}

	function onDeviceReady() {
		log("onDeviceReady");
		if (notDeviceTimer) {
			clearTimeout(notDeviceTimer);
		}

		mockPositionner = new mockPositionnerModule.MockPositionner();
		initSpeech();
		initControls();
		perUpdate = new perUpdateModule.PerUpdate(); // move into initSpeech() callback
		perUpdate.startReporting();
		log("onDeviceReady done");
	}

	function onNotDevice() {
		log("onNotDevice: calling onDeviceReady regardless for testing");
		onDeviceReady();
	}

	// Set timeout for this not being device to allow testing on webpage
	// TODO: Find better way to do this.
	function prepForNotDevice() {
		log("prepForNotDevice");
		notDeviceTimer = setTimeout(onNotDevice, 3000);
	}

	module.init = function() {
		prepForNotDevice();
		// the next line makes it impossible to see Contacts on the HTC Evo since it
		// doesn't have a scroll button
		// document.addEventListener("touchmove", preventBehavior, false);
		document.addEventListener("deviceready", onDeviceReady, true);
		log("init done -- awaiting onDeviceReady");
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.main = module;

})(window, jQuery, rnib.tts, rnib.log.log, rnib.perUpdate, rnib.mockPositionner);
