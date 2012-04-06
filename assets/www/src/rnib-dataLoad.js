;(function(exports, $, LocationModule, WayModule, PlaceModule, POIModule, FindResultsModule, geo, log) {

	var module = {};
	var SEARCH_RADIUS_KM = 0.03; // TODO: Tune SEARCH_RADIUS_KM.  Later make it user-configurable.

	/**
	 * @constructor
	 */
	function Bounds(map) {
		var jqb = $(map).find("bounds");
		var minLon = jqb.attr('minlon');
		var maxLon = jqb.attr('maxlon');
		var minLat = jqb.attr('minlat');
		var maxLat = jqb.attr('maxlat');

		this.contains = function(coords) {
			return (coords.lat >= minLat && coords.lat <= maxLat && coords.lon >= minLon && coords.lon <= maxLon);
		};

		this.toString = function() {
			return "Bounds(min(" + minLat + "," + minLon + "), max(" + maxLat + "," + maxLon + "))";
		};
	}

	/**
	 * @constructor
	 * @param {geo.GeoCoord} center Center of this MapSegment.
	 */
	function MapSegment(center) {
		// var that = this;

		/** @type Bounds */
		var bounds = null;
		var numberOfNodes = 0;
		var locationById = {}; // TODO: Move locationById from MapSegment to MapSegment.Builder and remove getLocationById() (or rework for test use)

		/** @type PlaceModule.Place[] */
		var placesToBeNear = []; // TODO: Resolve locationsOnRoads and placesToBeNear (do we need both?)

		/** @type PlaceModule.Place[] */
		var poiPlaces = [];

		/** @type LocationModule.Location[] */
		var locationsOnRoads = [];

		// /** @type WayModule.Way[] */
		var highways = [];

		/**
		 * Get the Location nearest supplied latitude & longitude from the supplied list.
		 * API allows for null if no element near but present implementation always returns an instance.
		 * @param {PlaceModule.Place[]} list List of elements to work from.
		 * @param {geo.GeoCoord} targetCoords Where to search for.
		 * @type LocationModule.Location
		 * @throws Error if targetCoords outside bounds of the map this MapSegment knows about.
		 */
		// TODO: Consider background thread to do this? (computationally expensive until spatial data-structure used)
		function getFromNearestLatLon(list, targetCoords) {
			log.debug("searching for " + targetCoords);

			if (!bounds.contains(targetCoords)) {
				// TODO: If lat,lon are outside current bounds, load new data and redo.
				throw new Error("outside loaded bounds! " + targetCoords + " outside " + bounds);
			}

			var d = 9999999999999;
			var steps = 0;
			/** @type POI */
			var closestResult = null;
			for (var i = list.length - 1; i >= 0; i--) {
				var p = list[i];
				var poi = p.getPOIIfClose(targetCoords, d);
				if (poi) { // p is closer than d
					d = poi.range;
					closestResult = poi;
					steps++;
				}
			}
			log.debug("getFromNearestLatLon(list, " + targetCoords + ") searched " + numberOfNodes + " elements, taking " + steps + " steps to find one " + d + " away: " + closestResult);
			return closestResult;
		}

		/**
		 * Get POI for all list members (e.g. placesToBeNear) within radius of targetCoords.
		 * @param {PlaceModule.Place[]} list List of elements to work from.
		 * @param {geo.GeoCoord} targetCoords Where to search for.
		 * @param {Number} radius Radius to search for items within.
		 * @type POIModule.POI[]
		 * @throws Error if targetCoords outside bounds of the map this MapSegment knows about.
		 */
		function getAllFromWithinRadius(list, targetCoords, radius) {
			log.debug("searching within " + radius + " for " + targetCoords);

			if (!bounds.contains(targetCoords)) {
				// TODO: If lat,lon are outside current bounds, load new data and redo.
				throw new Error("outside loaded bounds! " + targetCoords + " outside " + bounds);
			}

			/** @type POIModule.POI[] */
			var results = [];
			for (var i = list.length - 1; i >= 0; i--) {
				var n = list[i];
				var poi = n.getPOIIfClose(targetCoords, radius);
				if (poi) {
					results.push(poi);
				}
			}
			log.debug("getAllFromWithinRadius(list, " + targetCoords + ", " + radius + ") searched " + list.length + " elements and found " + results.length + " items.");
			return results;
		}

		//
		// Helper objects
		//

		function Builder() {
			// var that = this;

			/** @type Function */
			var dataLoadedCallback;

			/** @type Function */
			var loadingErrorCallback;

			// /**
			//  * Map of node IDs -> Ways.
			//  */
			// var nodesToWays = {};

			function onGetMapDataError(err) {
				log.debug("mapDataLoadError: " + err.statusText);
				loadingErrorCallback(err); // TODO: alert("onGetMapDataError: " + err.statusText);
			}

			function updateAttributesFrom(attributesObject, nodeWayOrRelationSource) {
				$(nodeWayOrRelationSource).find("tag").each(function(i, tagSrc) {
					var jqTag = $(tagSrc);
					var k = jqTag.attr('k');
					var v = jqTag.attr('v');
					attributesObject[k] = v;
				});

				if (false === attributesObject.visible) {
					return null;
				} else {
					return attributesObject;
				}
			}

			/**
			 * Append one array's members to the other.
			 * @param {Array} srcArray Array to copy members from.
			 * @param {Array} targetArray Array to append to.
			 */
			function appendAllTo(srcArray, targetArray) {
				targetArray.push.apply(targetArray, srcArray);
			}

			// N.b. This can be called with Ways and Relations (not just Locations)!
			/** @type Function[] */
			var classifiersGeneral = [];

			// N.b. locations DO NOT have ways at this point!
			/** @type Function[] */
			var classifiersLocationsOnly = [
				function roadLike(l, c) {
					if (c.highway && c.highway != 'traffic_signals') {
						locationsOnRoads.push(l); // FIXME: Needs de-duping here or Way's version.
					}
				},
				function placeLike(l, c) {
					if (c.highway) {
						return; // highway points go in locationsOnRoads
					}

					if (l.ownName || l.hasAddress()) {
						placesToBeNear.push(l);
						poiPlaces.push(l);
					}
				}
			];

			/** @type Function[] */
			var classifiersWaysOnly = [
				function roadLike(w, c) {
					if (c.highway) {
						// Record as highway
						highways.push(w);
						// TODO: Are highways also placesToBeNear?
					}
				},
				function placeLike(w, c) {
					// should have already filtered-out unnamed ways
					if ('yes' == c.building || w.hasAddress()) {
						poiPlaces.push(w);
						placesToBeNear.push(w);
					}
				}
			];

			/**
			 * @param {LocationModule.Location|WayModule.Way|RelationModule.Relation} locationWayOrRelation To classify.
			 */
			function classifyLocationWayOrRelation(locationWayOrRelation) {
				var c = locationWayOrRelation.attributes;
				var i, num;

				// general
				num = classifiersGeneral.length;
				for (i = 0; i < num; i++) {
					classifiersGeneral[i](locationWayOrRelation, c);
				}
				// node-only
				if (locationWayOrRelation instanceof LocationModule.Location) {
					num = classifiersLocationsOnly.length;
					for (i = 0; i < num; i++) {
						classifiersLocationsOnly[i](locationWayOrRelation, c);
					}
				// way-only
				} else if (locationWayOrRelation instanceof WayModule.Way) {
					num = classifiersWaysOnly.length;
					for (i = 0; i < num; i++) {
						classifiersWaysOnly[i](locationWayOrRelation, c);
					}
				}
			}

			function processNodeToLocation(nodeSrc) {
				var attributes = updateAttributesFrom({}, nodeSrc);
				if (!attributes) {
					return false;
				}

				var newLoc = new LocationModule.Location(nodeSrc, attributes);
				locationById[newLoc.id] = newLoc;
				classifyLocationWayOrRelation(newLoc);
				return true;
			}

			/**
			 * PRE-CONDITION: processNodeToLocation() called.
			 */
			function processWay(waySrc) {
				var attributes = updateAttributesFrom({}, waySrc);
				if (!attributes) {
					return false;
				}

				// ways sometimes have no name (e.g. unnamed buildings)
				// Dropping unnamed (e.g. buildings = lots!) for now but may later find can have other interesting info?
				if (!attributes.name) {
					return false;
				}

				var w = new WayModule.Way(waySrc, attributes);

				$(waySrc).find("nd").each(function(j, nodeSrc) {
					// add all the way's nodes
					var nodeRefd = $(nodeSrc).attr("ref");
					var l = locationById[nodeRefd];
					l.addWay(w);

					w.addLocation(l);
				});

				classifyLocationWayOrRelation(w);
				return true;
			}

			/** Record loaded data into our internal datastructures. */
			function onMapLoaded(map) {
				bounds = new Bounds(map);

				log.debug("Processing nodes (dropping invisible)...");

				var numIncDropped = 0;
				$(map).find("node").each(function(i, nodeSrc) {
					if (processNodeToLocation(nodeSrc)) {
						numberOfNodes++;
					}
					numIncDropped = i;
				});

				log.debug("...finished processing " + numberOfNodes + " Locations from " + (numIncDropped + 1) + " nodes.\nProcessing ways (dropping invisible and unnamed)...");

				var numWays = 0;
				$(map).find("way").each(function(i, w) {
					if (processWay(w)) {
						numWays++;
					}
					numIncDropped = i;
				});

				log.debug("...finished processing " + numWays + " Ways from " + (numIncDropped + 1) + " ways.  Calling dataLoadedCallback.");

				dataLoadedCallback(map);
			}

			//
			// Public methods
			//

			this.beginBuilding = function(onResult, onError) {
				dataLoadedCallback = onResult;
				loadingErrorCallback = onError;

				// TODO: Transform center (from MapSegment) into Bounds for loading from OSM

				log.debug("loading map data");
				$.ajax({
					url : "data/barbican.xml",
					dataType : "xml",
					success : onMapLoaded,
					error : onGetMapDataError,
					timeout : 100000
				});
			};
		}

		//
		// Public methods (MapSegment)
		//

		this.load = function(onResult, onError) {
			var builder = new Builder();
			builder.beginBuilding(onResult, onError);
		};

		this.getLocationById = function(id) {
			return locationById[id];
		};

		/**
		 * Find FindResults (including nearest Location and POIs) near targetCoords.
		 * @param {geo.GeoCoords} targetCoords Coords to search near.
		 * @type FindResultsModule.FindResults
		 */
		this.findNear = function(targetCoords) {
			log.debug("findNear: targetCoords:" + targetCoords);
			var closestPOI = getFromNearestLatLon(placesToBeNear, targetCoords);
			log.debug("findNear: found " + closestPOI);
			log.debug("findNear: finding POIs");
			var nearby = getAllFromWithinRadius(poiPlaces, targetCoords, SEARCH_RADIUS_KM);
			var results = new FindResultsModule.FindResults(closestPOI, nearby);
			log.debug("findNear: Returning " + results);
			return results;
		};

	}

	function LocationProviderOSM() {
		// var that = this;

		/** @type MapSegment */
		var mapSegment;

		function onLoadedFindNear(targetCoords, onResult, onError) {
			var l = mapSegment.findNear(targetCoords);
			onResult(l);
		}

		function loadSegmentFor(targetCoords, onCompletion, onFailure) {
			log.debug("loadSegmentFor(): " + targetCoords);
			mapSegment = new MapSegment(targetCoords);
			mapSegment.load(onCompletion, onFailure);
		}

		//
		// Public methods
		//

		/**
		 * Get a Location by node ID or null if ID unknown.
		 * DEVELOPMENT-TIME only.
		 * @type LocationModule.Location
		 */
		this.getLocationById = function(id) {
			return mapSegment.getLocationById(id);
		};

		/**
		 * Find FindResults nearest to the supplied coordinates and call callback with answer.
		 * Primary API entry-point.
		 * @param {geo.GeoCoord} targetCoords Where to look near.
		 * @param {Function(FindResultsModule.FindResults)} onResult Callback to receive answer.  Async because may need to load data from cache/server.
		 * @param {Function(err)} onError Callback to receive error.  Likely when offline and data not cached.
		 */
		this.findNear = function(targetCoords, onResult, onError) {
			if (!mapSegment) {
				log.debug("findNear: no mapSegment -- loading");
				loadSegmentFor(targetCoords,
					function(){
						onLoadedFindNear(targetCoords, onResult, onError);
					},
					function(err){
						onError(err);
					}
				);
			} else {
				try {
					onLoadedFindNear(targetCoords, onResult, onError);
				} catch (err) {
					log.error("findNear: error: " + err);
					alert("Error finding place:\n" + err);
				}
			}
		};

		// TODO: DELETEME: Temporary method to force loading to allow synchronous use of other methods. (for testing & initial development)
		this.TEMP_LOAD = function(onResult, onError) {
			loadSegmentFor(new geo.GeoCoord(99, 99), onResult, onError);
		};

	}

	module.LocationProviderOSM = LocationProviderOSM;

	exports.rnib = exports.rnib || {};
	exports.rnib.mapData = module;
})(this, jQuery, rnib.location.LocationModule, rnib.location.WayModule, rnib.location.PlaceModule, rnib.location.POIModule, rnib.location.FindResultsModule, rnib.geo, rnib.log);

