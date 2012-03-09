(function(exports, $, location, geo, log) {

	var module = {};

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
		var locationById = {};

		/** @type location.Location[] */
		var places = [];

		/** @type location.Location[] */
		var locationsOnRoads = [];

		/** @type location.Way */
		var highways = [];

		/**
		 * Get the Location nearest supplied latitude & longitude from the supplied list.
		 * API allows for null if no element near but present implementation always returns an instance.
		 * @param {Array} list List of elements to work from.
		 * @param {geo.GeoCoord} targetCoords Where to search for.
		 * @type location.Location
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
			var i = 0;
			var closestElement = null;
			for (var id in list) {
				if (list.hasOwnProperty(id)) {
					var n = list[id];
					var ds = n.coordinates.distanceTo(targetCoords);
					if (ds < d) {
						d = ds;
						closestElement = n;
						i++;
					}
				}
			}
			log.debug("getFromNearestLatLon(list, " + targetCoords + ") searched " + numberOfNodes + " elements, taking " + i + " steps to find one " + d + " away: " + closestElement);
			return closestElement;
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
			var classifiersGeneral = [];

			// N.b. locations DO NOT have ways at this point!
			var classifiersLocationsOnly = [
				function roadLike(l, c) {
					if (c.highway) {
						locationsOnRoads.push(l); // FIXME: Needs de-duping here or Way's version.
					}
				},
				function placeLike(l, c) {
					if (c.highway) {
						return; // highway points go in locationsOnRoads
					}

					var isPlace = false;
					if (l.ownName) {
						isPlace = true;
					}

					if (isPlace) {
						places.push(l);
					}
				}
			];

			var classifiersWaysOnly = [
				function roadLike(w, c) {
					if (c.highway) {
						// Record as highway
						highways.push(w);
						// Add all way's Locations to places.
						appendAllTo(w.locations, locationsOnRoads);
					}
				},
				function placeLike(w, c) {
					// should have already filtered-out unnamed ways
					var isPlace = false;
					if ('yes' == c.building) {
						isPlace = true;
					}

					if (isPlace) {
						// Add all way's Locations to places.
						appendAllTo(w.locations, places);
					}
				}
			];

			/**
			 * @param {location.Location|location.Way|location.Relation} locationWayOrRelation To classify.
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
				if (locationWayOrRelation instanceof location.Location) {
					num = classifiersLocationsOnly.length;
					for (i = 0; i < num; i++) {
						classifiersLocationsOnly[i](locationWayOrRelation, c);
					}
				// way-only
				} else if (locationWayOrRelation instanceof location.Way) {
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

				var newLoc = new location.Location(nodeSrc, attributes);
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

				var w = new location.Way(waySrc, attributes);

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

		this.findPlaceNear = function(targetCoords) {
			return getFromNearestLatLon(places, targetCoords);
		};

	}

	function LocationProviderOSM() {
		// var that = this;

		/** @type MapSegment */
		var mapSegment;

		function onLoadedFindPlaceNear(targetCoords, onResult, onError) {
			var l = mapSegment.findPlaceNear(targetCoords);
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
		 * @type location.Location
		 */
		this.getLocationById = function(id) {
			return mapSegment.getLocationById(id);
		};

		/**
		 * Find the Location within bounds nearest to the supplied coordinates.
		 * @param {geo.GeoCoord} targetCoords Where to look near.
		 * @param {Function(location.Location)} onResult Callback to receive answer.  Async because may need to load data from cache/server.
		 * @param {Function(err)} onError Callback to receive error.  Likely when offline and data not cached.
		 */
		this.findPlaceNear = function(targetCoords, onResult, onError) {
			if (!mapSegment) {
				log.debug("findPlaceNear: no mapSegment -- loading");
				loadSegmentFor(targetCoords,
					function(){
						onLoadedFindPlaceNear(targetCoords, onResult, onError);
					},
					function(err){
						onError(err);
					}
				);
			} else {
				try {
					onLoadedFindPlaceNear(targetCoords, onResult, onError);
				} catch (err) {
					log.error("findPlaceNear: error: " + err);
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
})(this, jQuery, rnib.location, rnib.geo, rnib.log);

