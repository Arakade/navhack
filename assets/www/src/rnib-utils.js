// Miscellaneous utilities
;(function(exports, log) {
	var module = {};

	if(!Function.method) {
		log.log("Adding Function.method()");
		Function.prototype.method = function (name, func) {
		    this.prototype[name] = func;
		    return this;
		};
	}

	// Add Function.bind() if missing to allow scope recapture
	if(!Function.bind) {
		log.log("Adding Function.bind()");
		Function.prototype.bind = function(scope) {
			var _function = this;
			return function() {
				return _function.apply(scope, arguments);
			};
		};
	}

	exports.rnib = exports.rnib || {};
	exports.rnib.utils = module;
})(this, console);
