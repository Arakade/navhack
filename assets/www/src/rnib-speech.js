// Module to abstract TTS across platforms.
// Initially hardcoded to log and call Android PhoneGap TTS plugin.
;(function(exports, $, pgTTS, log) {

	var module = {};
	var textArea; // TODO: Try determining HTML item and populate if no TTS

	function ttsSuccess(result) {
		// do nothing
	}

	function ttsFailed(err) {
		log("speech failure: code:" + err.code + ", cause:" + err.message + " (while trying to say \"" + err.speech + "\")");
	}

	module.init = function(ttsLoadSuccessCallback, ttsLoadFailedCallback) {
		if (pgTTS) {
			pgTTS.startup(ttsLoadSuccessCallback, ttsLoadFailedCallback);
		} else {
			log("no device TTS available (from pgTTS)");
		}
	};

	module.speak = function(msg) {
		log("TTS: " + msg);
		if (pgTTS) {
			pgTTS.speak(msg, ttsSuccess, ttsFailed);
		}
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.tts = module;
})(window, jQuery, window.plugins.tts, rnib.log.log);
