(function(exports, $, geo, log) {

	var module = {};

	function initCoordData(nodeSrc) {
		var jqNode = $(nodeSrc);
		var lat = parseFloat(jqNode.attr("lat"));
		var lon = parseFloat(jqNode.attr("lon"));
		return new geo.GeoCoord(lat, lon);
	}

	module.GoodNode = function GoodNode(nodeSrc, theWays) {
		this.nodeSrc = nodeSrc;
		this._id = $(nodeSrc).attr("id");

		var _coordData = initCoordData(nodeSrc);
		// TODO: Unit test
		this.__defineGetter__("coordinates", function() {
			return _coordData;
		});

		this.__defineGetter__("ways", function() {
			return theWays;
		});
	};

	module.GoodWay = function GoodWay(src, wayName) {
		this.src = src;
		this.name = wayName;
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = module;
})(this, jQuery, rnib.geo, rnib.log.log);
