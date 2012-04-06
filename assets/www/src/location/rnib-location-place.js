;(function(exports, AddressModule, log) {
	var module = {};

	/**
	 * @constructor
	 */
	module.Place = function Place() {
		// TODO: Unit test Place methods.

		function assignAddress() {
			if (this._addressUntested) {
				this._addr = AddressModule.buildAddressOrNull(this.attributes);
				this._addressUntested = false;
			}
		}
		/**
		 * @type Address
		 */
		this.__defineGetter__("address", function() {
			assignAddress.bind(this)();
			return this._addr;
		});

		this.hasAddress = function() {
			assignAddress.bind(this)();
			return null !== this._addr;
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = exports.rnib.location || {};
	exports.rnib.location.PlaceModule = module;
})(this, rnib.location.AddressModule, rnib.log);
