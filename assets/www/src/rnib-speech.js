// Module to abstract TTS across platforms.
// Initially hardcoded to log and call Android PhoneGap TTS plugin.
(function(exports, $, undefined){

    var that = this;
    var module = {};
    var textArea; // TODO: Try determining HTML item and populate if no TTS

    module.init = function(ttsLoadSuccessCallback, ttsLoadFailedCallback) {
    	if (window.plugins.tts) {
    		window.plugins.tts.startup(ttsLoadSuccessCallback, ttsLoadFailedCallback);
    	} else {
    		console.log("no device TTS available (from window.plugins.tts)");
    	}
    }

    module.speak = function(msg) {
    	console.log("TTS: "+ msg);
    	if (window.plugins.tts) {
    		window.plugins.tts.speak(msg, ttsSuccess, ttsFailed);
    	}
    }

    function ttsSuccess(result) {
    	// do nothing
    }

    function ttsFailed(err) {
    	console.log("speech failure: code:"+ err.code +", cause:"+ err.message +" (while trying to say \""+ err.speech +"\")");
    }

    exports.rnib = exports.rnib || {};

    exports.rnib.tts = module;
})(window, jQuery)