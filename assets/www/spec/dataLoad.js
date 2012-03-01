describe("dataLoad", function () {
	var mapDataModule = rnib.mapDataModule;

	describe("loading data", function () {
		console.log("in loading data function");

		var maxLat=51.53363,
			minLon=-0.13596,
			maxLon=-0.11205,
			minLat=51.51932;

		var callbackCalled = false;
		var mapResult = null;
		mapDataModule.registerDataLoadedCallback(function dataLoaded(map) {
			callbackCalled = true;
			mapResult = map;
		});
		mapDataModule.loadDataFor(minLon, minLat, maxLon, maxLat);

		waitsFor(function() {
			console.log("loading data called-back");
			return callbackCalled;
		}, "Loading data timed-out.", 2000);

		describe("should", function() {
			it("have non-null loaded data", function () {
				expect(mapResult).not.toBeNull();
			});

			it("not find an absent node ID", function () {
				var n1 = mapDataModule.getNodeById("99999");
				expect(n1).toBeUndefined();
			});
		});

		describe("for a *specific* contained node ID", function () {
			describe("should", function() {
				it("not be null", function () {
					var n1 = mapDataModule.getNodeById("108417");
					expect(n1).not.toBeNull();
				});
			});

			describe("should have coordinates", function () {
				it("that are not null", function () {
					var n1 = mapDataModule.getNodeById("108417");
					var n1Coords = n1.coordinates;
					expect(n1Coords).not.toBeNull();
					console.log("n1Coords: "+ n1Coords);
				});

				it("that are correct", function () {
					var n1 = mapDataModule.getNodeById("108417");
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
					var n1 = mapDataModule.getNodeById("108417");
					var n1Ways = n1.ways;
					expect(n1Ways).not.toBeNull();
					console.log("n1Ways: "+ n1Ways);
				});

				it("that have the correct name", function () {
					var n1 = mapDataModule.getNodeById("108417");
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.name).toEqual("Old Street");
				});

				it("that disallow assignment (silently ignoring attempt to use undefined setter)", function () {
					var n1 = mapDataModule.getNodeById("108417");
					n1.ways = ['not', 'allowed']; // silently fails
					var n1Ways = n1.ways;
					var w1 = n1Ways[0];
					expect(w1.name).toEqual("Old Street");
				});
			});
		});

		describe("near a known location", function() {
			it("should find non-null node", function () {
				var lat0 = 51.52454555500299;
				var lon0 = -0.09877452626824379;
				var n1 = mapDataModule.getNodeNearestLatLon(lat0, lon0);
				expect(n1).not.toBeNull();
			});

			it("should have some ways", function () {
				var lat0 = 51.52454555500299;
				var lon0 = -0.09877452626824379;
				var n1 = mapDataModule.getNodeNearestLatLon(lat0, lon0);
				var n1Ways = n1.ways;
				expect(n1Ways).not.toBeNull();
			});

			it("should find the correct way", function () {
				var lat0 = 51.52454555500299;
				var lon0 = -0.09877452626824379;
				var n1 = mapDataModule.getNodeNearestLatLon(lat0, lon0);
				var n1Ways = n1.ways;
				var w1 = n1Ways[0];
				expect(w1.name).toEqual("Clerkenwell and Bunhill Wards Police Station");
			});
		});
	});

});