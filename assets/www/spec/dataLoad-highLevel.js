xdescribe("high level data load,", function () {
	var mapDataModule = rnib.mapData;

	describe("loading data,", function () {
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
			xdescribe("find some 'interesting' places (not just any old place) and separately the 'road' its on", function() {
				// TODO: find some 'interesting' places (not just any old place) and separately the 'road' its on
				fail("TODO");
			});

			xdescribe("find what 'road' coord is on (nearest point on nearest 'road')", function() {
				// TODO: find what 'road' coord is on (nearest point on nearest 'road')
				fail("TODO");
			});

			xdescribe("find known junction (specific coords) and enumerate choices.", function() {
				// TODO: find known junction (specific coords) and enumerate choices.
				fail("TODO");
			});
		});
	});





});