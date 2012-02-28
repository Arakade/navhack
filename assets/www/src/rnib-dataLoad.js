(function(exports, $, geo, log) {

	var module = {};

	var numberOfNodes = 0;
	var nodeById = {};
	var nodesToGoodWays = {};

	var dataLoadedCallback;

	//
	// Private methods
	//

	function getWaysByNode(id) {
		return nodesToGoodWays[id];
	}

	function GoodNode(nodeSrc) {
		this.nodeSrc = nodeSrc;
		this.id = $(nodeSrc).attr("id");
		/** private & lazy initialized. */
		this._coordData = null;

		this.getWays = function() {
			return getWaysByNode(this.id);
		};
		/** Lazily defines coordinates. */
		// TODO: Unit test
		this.__defineGetter__("coordinates", function() {
			if (this._coordData) {
				return this._coordData;
			}
			var jqNode = $(nodeSrc);
			var lat = parseFloat(jqNode.attr("lat"));
			var lon = parseFloat(jqNode.attr("lon"));
			this._coordData = new geo.GeoCoord(lat, lon);
			return this._coordData;
		});
	}

	function GoodWay(src, wayName) {
		this.src = src;
		this.name = wayName;
	}

	function buildWayIfNamed(waySource) {
		var names = $(waySource).find("tag[k='name']");
		if (!names || 0 === names.size()) {
			return null;
		}

		var name = $(names[0]).attr("v");
		if (name) {
			return new GoodWay(waySource, name);
		} else {
			return null;
		}
	}

	function onGetMapDataError(err) {
		log("mapDataLoadError: " + err.statusText);
		alert("onGetMapDataError: " + err.statusText);
	}

	/** Record loaded data into our internal datastructures. */
	function onMapLoaded(map) {
		module.map = map;
		// bounds = $(map).find("bounds");

		var c1 = 0;
		$(map).find("node").each(function(i, nodeSrc) {
			var goodNode = new GoodNode(nodeSrc);
			var key = goodNode.id;
			nodeById[key] = goodNode;
			numberOfNodes++;
			c1 = i;
		});
		log("last node processed: " + c1);

		var c2 = 0;
		$(map).find("way").each(function(i, w) {
			var goodWay = buildWayIfNamed(w);
			if (goodWay) {
				$(w).find("nd").each(function(i, nd) {
					var node = $(nd).attr("ref");
					if (!nodesToGoodWays[node]) {
						nodesToGoodWays[node] = [];
					}
					nodesToGoodWays[node].push(goodWay);
				});
				c2 = i;
			}
		});

		log("last way processed: " + c2 + ", calling dataLoadedCallback");

		dataLoadedCallback(map);
	}

	//
	// Public methods
	//

	module.registerDataLoadedCallback = function(newCallback) {
		dataLoadedCallback = newCallback;
	};

	module.loadDataFor = function(minLon, minLat, maxLon, maxLat) {
		$.ajax({
			url : "data/barbican.xml",
			dataType : "xml",
			success : onMapLoaded,
			error : onGetMapDataError,
			timeout : 100000
		});
	};

	/**
	 * Get the GoodNode nearest supplied latitude & longitude.
	 * API allows for null if no node near but present implementation always returns an instance.
	 */
	// TODO: Recommend background thread to do this? (computationally expensive until spatial data-structure used)
	module.getNodeNearestLatLon = function(lat, lon) {
		var d = 9999999999999;
		var i = 0;
		var targetCoords = new geo.GeoCoord(lat, lon);
		var closestNode = null;
		for (var id in nodeById) {
			if (nodeById.hasOwnProperty(id)) {
				var n = nodeById[id];
				var ds = n.coordinates.distanceTo(targetCoords);
				if (ds < d) {
					d = ds;
					closestNode = n;
					i++;
				}
			}
		}
		log("getNodeNearestLatLon(" + lat + ", " + lon + ") searched " + numberOfNodes + " nodes, taking " + i + " steps to find one " + d + " away: " + closestNode);
		return closestNode;
	};

	/** Get a GoodNode by node ID or null if ID unknown. */
	module.getNodeById = function(id) {
		return nodeById[id];
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.mapData = module;
})(this, jQuery, rnib.geo, rnib.log.log);
