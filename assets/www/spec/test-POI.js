describe("POIModule", function() {
	var mapDataModule = rnib.mapData;
	var GeoModule = rnib.geo;
	var PlaceModule = rnib.location.PlaceModule;
	var POIModule = rnib.location.POIModule;
	var LocationModule = rnib.location.LocationModule;
	var WayModule = rnib.location.WayModule;
	var log = console;

	var callbackCalled = false;
	var mapResult = null;
	var locationProvider = new mapDataModule.LocationProviderOSM();
	locationProvider.TEMP_LOAD(function dataLoaded(result) {
		console.log("POI Module data load: result:" + result);
		callbackCalled = true;
		mapResult = result;
	}, function(err){
		console.error("POI Module data load: error:" + err);
	});

	function whenLoadedIt(description, spec) {
		it(description, function() {
			waitsFor(function() {return callbackCalled;}, "timed-out.", 2000);
			runs(spec);
		});
	}

	var MockPlace = function MockPlace(){
		this.id = 0;
		this.equals = function(other) {
			return this.id === other.id;
		};
		this.toString = function() {
			return "MockPlace(" + this.id + ")";
		};
	};
	MockPlace.prototype = new PlaceModule.Place();
	var mockPlace = new MockPlace();
	var mockLocation = new LocationModule.Location();
	mockLocation.toString = function() {
		return "MockLocation";
	};
	var mockGeoCoord = new GeoModule.GeoCoord();
	mockGeoCoord.toString = function() {
		return "MockGeoCoord";
	};

	describe("instantiation", function() {
		describe("should throw errors", function() {
			describe("when null passed for", function() {
				it("all arguments", function() {
					expect(function() {return new POIModule.POI(null, null, null);}).toThrow(new Error("Must supply place, closestLocation and fromCoords.  Got (null, null, null)"));
				});
				it("1st argument", function() {
					expect(function() {return new POIModule.POI(null, "ignored", "ignored");}).toThrow(new Error("Must supply place, closestLocation and fromCoords.  Got (null, ignored, ignored)"));
				});
				it("2nd argument (TODO)", function() { // TODO: Fix failing test (see TODO in POI code)
					expect(function() {return new POIModule.POI("ignored", null, "ignored");}).toThrow(new Error("Must supply place, closestLocation and fromCoords.  Got (ignored, null, ignored)"));
				});
				it("3rd argument", function() {
					expect(function() {return new POIModule.POI("ignored", "ignored", null);}).toThrow(new Error("Must supply place, closestLocation and fromCoords.  Got (ignored, ignored, null)"));
				});
			});

			it("when not passed anything", function() {
				expect(function() {return new POIModule.POI();}).toThrow(new Error("Must supply place, closestLocation and fromCoords.  Got (undefined, undefined, undefined)"));
			});

			describe("when passed the wrong type for", function() {
				it("1st argument", function() {
					expect(function() {return new POIModule.POI("not a Place", mockLocation, mockGeoCoord);}).toThrow(new Error("Incorrect type(s) place:Place, closestLocation:Location and fromCoords:GeoCoord.  Got (not a Place, MockLocation, MockGeoCoord)"));
				});
				it("2nd argument (known failure -- see TODO)", function() {
					// TODO: See POIModule's TODO re. cyclic dependency
					expect(function() {return new POIModule.POI(mockPlace, "not a Location", mockGeoCoord);}).toThrow(new Error("Incorrect type(s) place:Place, closestLocation:Location and fromCoords:GeoCoord.  Got (MockPlace(0), not a Location, MockGeoCoord)"));
				});
				it("3rd argument", function() {
					expect(function() {return new POIModule.POI(mockPlace, mockLocation, "not a GeoCoord");}).toThrow(new Error("Incorrect type(s) place:Place, closestLocation:Location and fromCoords:GeoCoord.  Got (MockPlace(0), MockLocation, not a GeoCoord)"));
				});
			});
		});

		describe("when given valid arguments", function() {
			it("should not be null", function() {
				expect(new POIModule.POI(mockPlace, mockLocation, mockGeoCoord)).not.toBeNull();
			});
			it("should be POI", function() {
				expect(new POIModule.POI(mockPlace, mockLocation, mockGeoCoord) instanceof POIModule.POI).toBeTruthy();
			});
		});
	});

	it("should expose the supplied place", function() {
		expect(new POIModule.POI(mockPlace, mockLocation, mockGeoCoord).place).toBe(mockPlace);
	});

	it("should expose the supplied closestLocation", function() {
		expect(new POIModule.POI(mockPlace, mockLocation, mockGeoCoord).closestLocation).toBe(mockLocation);
	});

	describe("Location-based instance", function() {
		describe("should provide the Location's coords for", function() {
			whenLoadedIt("closest to 0,0", function() {
				var l = locationProvider.getLocationById("108417");
				var radius = 999999; // always in range
				var poi = l.getPOIIfClose(new GeoModule.GeoCoord(0, 0), radius);
				expect(poi).not.toBeNull();
				expect(poi.closestLocation).toBe(l);
			});

			whenLoadedIt("closest to 99,99", function() {
				var l = locationProvider.getLocationById("108417");
				var radius = 999999; // always in range
				var poi = l.getPOIIfClose(new GeoModule.GeoCoord(99, 99), radius);
				expect(poi).not.toBeNull();
				expect(poi.closestLocation).toBe(l);
			});
		});

		describe("should calculate range correctly", function() {
			whenLoadedIt("has its coordinates' range from 0,0", function() {
				var l = locationProvider.getLocationById("108417");
				var origin = new GeoModule.GeoCoord(0, 0);
				var expected = l.coordinates.distanceTo(origin);
				var radius = 999999; // always in range
				var poi = l.getPOIIfClose(origin, radius);
				expect(poi).not.toBeNull();
				expect(poi.range).toEqual(expected);
			});
		});

		describe("should calculate bearing correctly", function() {
			whenLoadedIt("has its coordinates' bearing from 0,0", function() {
				var l = locationProvider.getLocationById("108417");
				var origin = new GeoModule.GeoCoord(0, 0);
				var expected = origin.bearingTo(l.coordinates);
				var radius = 999999; // always in range
				var poi = l.getPOIIfClose(origin, radius);
				expect(poi).not.toBeNull();
				expect(poi.bearing).toEqual(expected);
			});
		});

		describe("should calculate clock point correctly", function() {
			whenLoadedIt("has its coordinates' clock point from 0,0", function() {
				var l = locationProvider.getLocationById("108417");
				var origin = new GeoModule.GeoCoord(0, 0);
				var expected = "12 o'clock"; // origin.bearingTo(l.coordinates);
				var radius = 999999; // always in range
				var poi = l.getPOIIfClose(origin, radius);
				expect(poi).not.toBeNull();
				expect(poi.clockPoint).toEqual(expected);
			});
		});

	});


	/**
	 * Test Way's version of getPOIIfClose().
	 * Since there is no LocationProvider.getWay() method, cheat:
	 * - use findNear() near a known location to retrieve a FindResults which has a closestPOI.place which is a known Way.
	 * - then run POI-producing tests directly on that Way.
	 */
	describe("POIs generated by a Way shold provide Way's closest Location", function() {
		function withAWayIt(description, assertions) {
			var coordsNearWay = new GeoModule.GeoCoord(51.52454555500299, -0.09877452626824379);
			it(description, function() {
				waitsFor(function() {return callbackCalled;}, "timed-out.", 2000);
				runs(function() {
					var done = false;
					locationProvider.findNear(coordsNearWay, function onSuccess(results) {
						var way = results.closestPOI.place;
						expect(way instanceof WayModule.Way).toBeTruthy();
						assertions(way);
						done = true;
					}, function(err) {
						expect(err).toBe("NOT AN ERROR!"); // i.e. fail
					});
					expect(done).toBeTruthy(); // synchronous callback expected since we pre-loaded the data.
				});
			});
		}

		// Parameterized
		withAWayIt("for each of the Way's Locations", function(way){
			var locations = way.locations;
			for (var i = locations.length - 1; i >= 0; i--) {
				var expected = locations[i];
				var locationCoords = expected.coordinates;
				var radius = 999999; // always in range
				var poi = way.getPOIIfClose(locationCoords, radius);
				expect(poi).not.toBeNull();
				expect(poi.closestLocation).toEqual(expected);
				expect(poi.range).toBe(0);
			}
		});

	});

	describe("poiPlaceMatches", function() {
		it("should return true when places match", function() {
			var mpa = new MockPlace();
			mpa.id = 12345;
			var a = new POIModule.POI(mpa, mockLocation, mockGeoCoord);

			var mpb = new MockPlace();
			mpb.id = 12345;
			var b = new POIModule.POI(mpb, mockLocation, mockGeoCoord);

			expect(a.poiPlaceMatches(b)).toBeTruthy();
		});
		it("should return false when places do not match", function() {
			var mpa = new MockPlace();
			mpa.id = 12345;
			var a = new POIModule.POI(mpa, mockLocation, mockGeoCoord);

			var mpb = new MockPlace();
			mpb.id = 56789;
			var b = new POIModule.POI(mpb, mockLocation, mockGeoCoord);

			expect(a.poiPlaceMatches(b)).not.toBeTruthy();
		});
	});

});
