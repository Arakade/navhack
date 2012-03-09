;(function(exports, $, tts, log, perUpdateModule, mapDataModule, mockPositionnerModule) {

	var module = {};

	var perUpdate,
		mockPositionner = null;
	var locationProvider;

	var readyCountdown;
	function ReadyCountdown(moduleNames) {
		var fullyReadyIfZero = moduleNames.length;

		function removeModuleName(name) {
			var i = moduleNames.indexOf(name);
			if (-1 !== i) {
				moduleNames.splice(i, 1);
				log.log("ReadyCountDown: " + name + " ready.");
			}
		}

		function fullyReady() {
			log.log("ReadyCountDown: fully ready");
			perUpdate = new perUpdateModule.PerUpdate(locationProvider);
			perUpdate.startReporting();
			readyCountdown = null;
		}

		this.moreReady = function(whatIsDone) {
			removeModuleName(whatIsDone);
			if (!--fullyReadyIfZero) {
				fullyReady();
			} else {
				log.log("ReadyCountDown: waiting for " + moduleNames);
			}
		};
	}
	readyCountdown = new ReadyCountdown(["DeviceInit", "InitTTS", "DataLoadInit"]);

	// TEMPORARY: Data load will need to be triggered off GPS acquisition.  Here until proven.
	var dataLoadInit;
	function DataLoadInit() {
		this.init = function() {
			locationProvider = new mapDataModule.LocationProviderOSM();
			locationProvider.TEMP_LOAD(function dataLoaded(result) {
				readyCountdown.moreReady("DataLoadInit");
				dataLoadInit = null;
			}, function(err){
				log.error("loadSegmentFor(): error:" + err);
			});
		};
	}
	dataLoadInit = new DataLoadInit();

	var ttsInit;
	function InitTTS() {
		var saidHi = false;

		function ready() {
			readyCountdown.moreReady("InitTTS");
			ttsInit = null;
		}

		function ttsSuccess(ret) {
			log.log("speech worked: " + ret);
			ready();
		}

		function ttsFailed(ret) {
			log.warn("speech failed: " + ret);
			alert("speech failed: " + ret);
			ttsInit = null;
		}

		function sayHi() {
			if(saidHi) {
				return;
			}
			saidHi = true;
			tts.speak("Hello to all at the Londroid R N I B Hack-a-thon", ttsSuccess, ttsFailed); // callbacks ignored atm
			ready(); // temp place since ttsSuccess isn't being called atm!
		}

		this.init = function() {
			var ttsLoaded = function(ret) {
				sayHi();
			};
			var ttsLoadFailed = function(ret) {
				alert("tts failed: " + ret);
				readyCountdown.moreReady("InitTTS"); // to allow browser-based testing
			};

			tts.init(ttsLoaded, ttsLoadFailed);
		};
	}
	ttsInit = new InitTTS();

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

	var deviceInit;
	function DeviceInit() {
		var notDeviceTimer = null;
		function onDeviceReady() {
			log.log("onDeviceReady");
			if (notDeviceTimer) {
				clearTimeout(notDeviceTimer);
			}

			mockPositionner = new mockPositionnerModule.MockPositionner();
			ttsInit.init();
			initControls();
			log.log("onDeviceReady done");
			readyCountdown.moreReady("DeviceInit");
			deviceInit = null;
		}

		function onNotDevice() {
			log.warn("onNotDevice: calling onDeviceReady regardless for testing");
			onDeviceReady();
		}

		// Set timeout for this not being device to allow testing on webpage
		// TODO: Find better way to do this.
		function prepForNotDevice() {
			log.log("prepForNotDevice");
			notDeviceTimer = setTimeout(function(){onNotDevice();}, 3000);
			log.log("notDeviceTimer:" + notDeviceTimer);
		}

		this.init = function() {
			prepForNotDevice();
			document.addEventListener("deviceready", onDeviceReady, true);
		};
	}
	deviceInit = new DeviceInit();

	module.init = function() {
		// the next line makes it impossible to see Contacts on the HTC Evo since it
		// doesn't have a scroll button
		// document.addEventListener("touchmove", preventBehavior, false);
		deviceInit.init();
		dataLoadInit.init();
		log.log("init done -- awaiting onDeviceReady");
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.main = module;

})(window, jQuery, rnib.tts, rnib.log, rnib.perUpdate, rnib.mapData, rnib.mockPositionner);
