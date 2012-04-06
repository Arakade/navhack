;(function(exports, log) {
	var module = {};

	// TODO: Unit test Address
	/**
	 * @constructor
	 */
	function Address(attributes) {
		 // TODO: Improve address use (international)
		this.__defineGetter__("number", function() {
			return attributes['addr:housenumber'];
		});
		this.__defineGetter__("name", function() {
			return attributes['addr:housename'];
		});
		this.__defineGetter__("street", function() {
			return attributes['addr:street'];
		});
		this.__defineGetter__("postcode", function() {
			return attributes['addr:postcode'];
		});
		this.isValid = function() {
			return (this.name || this.number) && this.street;
		};
		this.toString = function() {
			function part(value, join) {
				return (value ? value + join : "");
			}
			return part(this.name, ", ") +
				part(this.number, ", ") +
				part(this.street, ", ") + // TODO: Fix trailing comma if no postcode.
				part(this.postcode, "");
		};
	}

	// TODO: Unit test buildAddressOrNull()
	/**
	 * @type Address
	 */
	module.buildAddressOrNull = function(attributes) {
		 // TODO: Improve address detection
		 var addr = new Address(attributes);
		 if (addr.isValid()) {
			return addr;
		 } else {
			return null;
		 }
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.AddressModule = module;
})(this, rnib.log);
