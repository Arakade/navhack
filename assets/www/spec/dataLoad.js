describe("dataLoad", function () {
	var mapDataModule = rnib.mapData;
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

		waitsFor(function() {
			console.log("dataLoad test is polling for readiness");
			return callbackCalled;
		}, "Loading data timed-out.", 2000);

		describe("should", function() {
			it("have non-null loaded data", function () {
				expect(mapResult).not.toBeNull();
			});

			it("not find an absent node ID", function () {
				var n1 = provider.getLocationById("99999");
				expect(n1).toBeUndefined();
			});
		});

		describe("for a *specific* contained node ID", function () {
			describe("should", function() {
				it("not be null", function () {
					var n1 = provider.getLocationById("108417");
					expect(n1).not.toBeNull();
				});

				it("be a Location", function () {
					var n1 = provider.getLocationById("108417");
					expect(n1 instanceof rnib.location.Location).toBeTruthy();
				});
			});

			describe("should have coordinates", function () {
				it("that are not null", function () {
					var n1 = provider.getLocationById("108417");
					var n1Coords = n1.coordinates;
					expect(n1Coords).not.toBeNull();
					console.log("n1Coords: "+ n1Coords);
				});

				it("that are correct", function () {
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
				it("that are not null", function () {
					var n1 = provider.getLocationById("108417");
					var n1Ways = n1.ways;
					expect(n1Ways).not.toBeNull();
					console.log("n1Ways: "+ n1Ways);
				});

				it("that have the correct name", function () {
					var n1 = provider.getLocationById("108417");
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.name).toEqual("Old Street");
				});

				it("that disallow assignment (silently ignoring attempt to use undefined setter)", function () {
					var n1 = provider.getLocationById("108417");
					n1.ways = ['not', 'allowed']; // silently fails
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.name).toEqual("Old Street");
				});
			});

			describe("should have", function() {
				it("a named way", function() {
					var n1 = provider.getLocationById("108417");
					var w1 = n1.aNamedWay;
					expect(w1.name).toEqual("Old Street");
				});

				it("a name (itself)", function() {
					var n1 = provider.getLocationById("108417");
					var aName = n1.aName;
					expect(aName).toEqual("Old Street");
				});

				describe("its own name", function() {
					it("on those that have it", function() {
						var n1 = provider.getLocationById("292162858");
						var ownName = n1.ownName;
						expect(ownName).toEqual("Pizza Express");
					});

					it("null on those that don't have it", function() {
						var n1 = provider.getLocationById("108417");
						var ownName = n1.ownName;
						expect(ownName).toBeUndefined();
					});
				});
			});
		});

		function findAndTest(coords, assertions) {
			var done = false;
			provider.findPlaceNear(coords, function onSuccess(n1) {
				assertions(n1);
				done = true;
			}, function(err) {
				expect(err).toBe("NOT AN ERROR!"); // i.e. fail
			});
			expect(done).toBeTruthy(); // synchronous callback expected since we pre-loaded the data.
		}

		describe("near a known location", function() {
			it("should find non-null node", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(n1) {
					expect(n1).not.toBeNull();
				});
			});

			it("should have some ways", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(n1) {
					var n1Ways = n1.ways;
					expect(n1Ways).not.toBeNull();
				});
			});

			it("should find the correct way", function () {
				var coords = new geo.GeoCoord(51.52454555500299, -0.09877452626824379);
				findAndTest(coords, function(n1) {
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.name).toEqual("Clerkenwell and Bunhill Wards Police Station");
				});
			});
		});

		describe("annoying values", function() {
			it("should be fine", function() {
				var coords = new geo.GeoCoord(51.523718333333335, -0.09894833333333333);
				findAndTest(coords, function(n1) {
					expect(n1.aName).not.toBeNull();
				});
			});
		});
	});

});