(function(exports, $, geo, log) {

	var module = {};
	var DEBUG = false;

	function initCoordData(nodeSrc) {
		var jqNode = $(nodeSrc);
		var lat = parseFloat(jqNode.attr("lat"));
		var lon = parseFloat(jqNode.attr("lon"));
		return new geo.GeoCoord(lat, lon);
	}

	module.Location = function Location(nodeSrc, theWays) {
		// this.nodeSrc = nodeSrc;
		var id = $(nodeSrc).attr("id");
		var namedWay = null;
		var coordData = null;
		var _ownName = null;

		this.__defineGetter__("coordinates", function() {
			if (!coordData) {
				coordData = initCoordData(nodeSrc);
			}
			return coordData;
		});

		this.__defineGetter__("ownName", function() {
			if (!_ownName) {
				_ownName = $(nodeSrc).find("tag[k='name']").attr("v");
			}
			return _ownName;
		});

		this.__defineGetter__("ways", function() {
			return theWays;
		});

		// To use from logging.  MUST NOT call anything that logs!
		function internalToString(extraString) {
			return "Location(id:" + id + ", coordinates:" + this.coordinates + extraString + ")";
		}

		function findANamedWay() {
			if (!theWays) {
				if (DEBUG) {
					log.warn("No ways on " + internalToString(''));
				}
				return null;
			}
			var numWays = theWays.length;
			for (var i = 0; i < numWays; i++) {
				var w = theWays[i];
				if (w.name) {
					return w;
				}
			}
			return null;
		}

		this.__defineGetter__("aNamedWay", function() {
			if (!namedWay) {
				namedWay = findANamedWay();
			}
			return namedWay;
		});

		this.__defineGetter__("aName", function() {
			var name1 = this.ownName;
			if (name1) {
				return name1;
			}

			var aWay = this.aNamedWay;
			if (aWay) {
				return aWay.name;
			} else {
				return null;
			}
		});

		this.toString = function() {
			return internalToString(", name:" + this.aName);
		};
	};

	module.Way = function Way(src, wayName) {
		this.src = src;
		this.name = wayName;

		this.toString = function() {
			return "Way(" + wayName + ")";
		};
	};

	exports.rnib = exports.rnib || {};
	exports.rnib.location = module;
})(this, jQuery, rnib.geo, rnib.log);
