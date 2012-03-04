(function(exports, $, location, geo, log) {

	var module = {};

	var bounds = null;
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

	function buildWayIfNamed(waySource) {
		var names = $(waySource).find("tag[k='name']");
		if (!names || 0 === names.size()) {
			return null;
		}

		var aName = $(names[0]).attr("v");
		if (aName) {
			return new location.Way(waySource, aName);
		} else {
			return null;
		}
	}

	function onGetMapDataError(err) {
		log("mapDataLoadError: " + err.statusText);
		alert("onGetMapDataError: " + err.statusText);
	}

	function Bounds(map) {
		var jqb = $(map).find("bounds");
		var minLon = jqb.attr('minlon');
		var maxLon = jqb.attr('maxlon');
		var minLat = jqb.attr('minlat');
		var maxLat = jqb.attr('maxlat');

		this.contains = function(lat, lon) {
			return (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon);
		};

		this.toString = function() {
			return "Bounds(min(" + minLat + "," + minLon + "), max(" + maxLat + "," + maxLon + "))";
		};
	}

	/** Record loaded data into our internal datastructures. */
	function onMapLoaded(map) {
		module.map = map;
		bounds = new Bounds(map);

		log("Processing ways...");
		var numWays = 0;
		$(map).find("way").each(function(i, w) {
			var goodWay = buildWayIfNamed(w);
			if (goodWay) {
				$(w).find("nd").each(function(j, nd) {
					var node = $(nd).attr("ref");
					if (!nodesToGoodWays[node]) {
						nodesToGoodWays[node] = [];
					}
					nodesToGoodWays[node].push(goodWay);
				});
				numWays = i;
			}
		});

		log("...finished processing " + numWays + " ways.\nProcessing nodes...");

		var numNodes = 0;
		$(map).find("node").each(function(i, nodeSrc) {
			var nodeId = $(nodeSrc).attr("id");
			var ways = getWaysByNode(nodeId);
			var goodNode = new location.Location(nodeSrc, ways);
			nodeById[nodeId] = goodNode;
			numberOfNodes++;
			numNodes = i;
		});
		log("...finished processing " + numNodes  + " nodes, calling dataLoadedCallback");

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
	 * Get the Location nearest supplied latitude & longitude.
	 * API allows for null if no node near but present implementation always returns an instance.
	 */
	// TODO: Recommend background thread to do this? (computationally expensive until spatial data-structure used)
	module.getNodeNearestLatLon = function(lat, lon) {
		if (!bounds.contains(lat, lon)) {
			// TODO: If lat,lon are outside current bounds, load new data and redo.
			throw new Error("outside loaded bounds! (" + lat + "," + lon + ") outside " + bounds);
		}

		var d = 9999999999999;
		var i = 0;
		var targetCoords = new geo.GeoCoord(lat, lon);
		var closestNode = null;
		for (var id in nodeById) {
			if (nodeById.hasOwnProperty(id)) {
				var n = nodeById[id];
				// skip unnamed
				if (!n.aName) {
					continue;
				}
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

	/** Get a Location by node ID or null if ID unknown. */
	module.getNodeById = function(id) {
		return nodeById[id];
	};

	exports.rnib = exports.rnib || {};

	exports.rnib.mapData = module;
})(this, jQuery, rnib.location, rnib.geo, rnib.log.log);

