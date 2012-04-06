describe("dataLoad", function () {
	var mapDataModule = rnib.mapData;
	var LocationModule = rnib.location.LocationModule;
	var FindResultsModule = rnib.location.FindResultsModule;
	var geo = rnib.geo;

	describe("loading data", function () {
		console.log("in loading data function");

		var callbackCalled = false;
		var mapResult = null;
		var provider = new mapDataModule.LocationProviderOSM();
		provider.TEMP_LOAD(function dataLoaded(result) {
			console.log("loadSegmentFor(): result:" + result);
			callbackCalled = true;
			mapResult = result;
		}, function(err){
			console.error("loadSegmentFor(): error:" + err);
		});

		function whenLoadedIt(description, spec) {
			it(description, function() {
				waitsFor(function() {return callbackCalled;}, "timed-out.", 2000);
				runs(spec);
			});
		}

		describe("should", function() {
			whenLoadedIt("have non-null loaded data", function () {
				expect(mapResult).not.toBeNull();
			});

			whenLoadedIt("not find an absent node ID", function () {
				var n1 = provider.getLocationById("99999");
				expect(n1).toBeUndefined();
			});
		});

		describe("for a *specific* contained node ID", function () {
			describe("should", function() {
				whenLoadedIt("not be null", function () {
					var n1 = provider.getLocationById("108417");
					expect(n1).not.toBeNull();
				});

				whenLoadedIt("be a Location", function () {
					var n1 = provider.getLocationById("108417");
					expect(n1 instanceof LocationModule.Location).toBeTruthy();
				});
			});

			describe("should have coordinates", function () {
				whenLoadedIt("that are not null", function () {
					var n1 = provider.getLocationById("108417");
					var n1Coords = n1.coordinates;
					expect(n1Coords).not.toBeNull();
					console.log("n1Coords: "+ n1Coords);
				});

				whenLoadedIt("that are correct", function () {
					var n1 = provider.getLocationById("108417");
					var n1Coords = n1.coordinates;
					var expectedLat = 51.523314;
					var expectedLon = -0.0985343;
					expect(n1Coords.lat).toEqual(expectedLat);
					expect(n1Coords.lon).toEqual(expectedLon);
					console.log("n1Coords: "+ n1Coords);
				});
			});

			describe("should have ways", function() {
				whenLoadedIt("that are not null", function () {
					var n1 = provider.getLocationById("108417");
					var n1Ways = n1.ways;
					expect(n1Ways).not.toBeNull();
					console.log("n1Ways: "+ n1Ways);
				});

				whenLoadedIt("that have the correct name", function () {
					var n1 = provider.getLocationById("108417");
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.theName).toEqual("Old Street");
				});

				whenLoadedIt("that disallow assignment (silently ignoring attempt to use undefined setter)", function () {
					var n1 = provider.getLocationById("108417");
					n1.ways = ['not', 'allowed']; // silently fails
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.theName).toEqual("Old Street");
				});
			});

			describe("should have", function() {
				whenLoadedIt("a named way", function() {
					var n1 = provider.getLocationById("108417");
					var w1 = n1.aNamedWay;
					expect(w1.theName).toEqual("Old Street");
				});

				whenLoadedIt("a name (itself)", function() {
					var n1 = provider.getLocationById("108417");
					var aName = n1.aName;
					expect(aName).toEqual("Old Street");
				});

				describe("its own name", function() {
					whenLoadedIt("on those that have it", function() {
						var n1 = provider.getLocationById("292162858");
						var ownName = n1.ownName;
						expect(ownName).toEqual("Pizza Express");
					});

					whenLoadedIt("null on those that don't have it", function() {
						var n1 = provider.getLocationById("108417");
						var ownName = n1.ownName;
						expect(ownName).toBeUndefined();
					});
				});
			});
		});

		function findAndTest(coords, assertions) {
			waitsFor(function() {return callbackCalled;}, "timed-out.", 2000);
			runs(function() {
				var done = false;
				provider.findNear(coords, function onSuccess(results) {
					assertions(results);
					done = true;
				}, function(err) {
					expect(err).toBe("NOT AN ERROR!"); // i.e. fail
				});
				expect(done).toBeTruthy(); // synchronous callback expected since we pre-loaded the data.
			});
		}

		describe("near a known location", function() {
			it("should find non-null result", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					expect(results).not.toBeNull();
				});
			});

			it("should give FindResult", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					expect(results instanceof FindResultsModule.FindResults).toBeTruthy();
				});
			});

			it("should have non-null closestPOI", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					expect(results.closestPOI).not.toBeNull();
				});
			});

			it("should have non-null closestLocation", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					expect(results.closestPOI.closestLocation).not.toBeNull();
				});
			});

			it("should find non-null node", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					var n1 = results.closestPOI.closestLocation;
					expect(n1).not.toBeNull();
				});
			});

			it("should have some ways", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					var n1 = results.closestPOI.closestLocation;
					var n1Ways = n1.ways;
					expect(n1Ways).not.toBeNull();
				});
			});

			it("should have correct number of ways", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					var n1 = results.closestPOI.closestLocation;
					var n1Ways = n1.ways;
					expect(n1Ways.length).toBe(1);
				});
			});

			it("should find the correct way", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(results) {
					var n1 = results.closestPOI.closestLocation;
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.theName).toEqual("Clerkenwell and Bunhill Wards Police Station");
				});
			});

			describe("should have POIs", function() {
				it("that are not null", function() {
					var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
					findAndTest(coords, function(results) {
						var pois = results.POIs;
						expect(pois).not.toBeNull();
					});
				});

				it("numbering 1 (2 minus removal of closestPlace)", function() {
					var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
					findAndTest(coords, function(results) {
						var pois = results.POIs;
						expect(pois.length).toBe(1);
					});
				});

				it("with correct names", function() {
					var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
					findAndTest(coords, function(results) {
						var pois = results.POIs;
						// expect(pois[0].place.theName).toBe("Clerkenwell and Bunhill Wards Police Station"); // removed as closestPlace
						expect(pois[0].place.theName).toBe("Saddlers Sports Centre");
					});
				});

				describe("with the 1st", function() {
					it("having correct name", function() {
						var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
						findAndTest(coords, function(results) {
							var poi = results.POIs[0];
							expect(poi.place.theName).toBe("Saddlers Sports Centre");
						});
					});

					it("having correct numeric bearing", function() {
						var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
						findAndTest(coords, function(results) {
							var poi = results.POIs[0];
							expect(poi.bearing).toBe(313.7627854117492);
						});
					});

					it("having correct clock face bearing", function() {
						var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
						findAndTest(coords, function(results) {
							var poi = results.POIs[0];
							expect(poi.clockPoint).toBe("10 o'clock");
						});
					});
				});
			});
		});

		describe("annoying values", function() {
			it("should be fine", function() {
				var coords = new geo.GeoCoord(51.523718333333335, -0.09894833333333333);
				findAndTest(coords, function(results) {
					var n1 = results.closestPOI.closestLocation;
					expect(n1.aName).not.toBeNull();
				});
			});
		});

	});
});
