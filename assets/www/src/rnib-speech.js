// Module to abstract TTS across platforms.
// Initially hardcoded to log and call Android PhoneGap TTS plugin.
;(function(exports, log) {

	var module = {};
	var textArea; // TODO: Try determining HTML item and populate if no TTS
	var pgTTS = null; // = window.plugins.tts;

	function ttsSuccess(result) {
		// do nothing
	}

	function ttsFailed(err) {
		log.error("speech failure: code:" + err.code + ", cause:" + err.message + " (while trying to say \"" + err.speech + "\")");
	}

	module.init = function(ttsLoadSuccessCallback, ttsLoadFailedCallback) {
		pgTTS = window.plugins.tts;
		log.debug("pgTTS:"+ pgTTS);
		if (pgTTS) {
			pgTTS.startup(ttsLoadSuccessCallback, ttsLoadFailedCallback);
		} else {
			var errMsg = "no device TTS available (from pgTTS)";
			log.error(errMsg);
			ttsLoadFailedCallback(errMsg);
		}
	};

	module.speak = function(msg) {
		log.info("TTS: " + msg);
		if (pgTTS) {
			pgTTS.speak(msg, ttsSuccess, ttsFailed);
		}
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.tts = module;
})(window, rnib.log);
