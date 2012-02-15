describe("Points of interest finder", function () {

    describe("loading data", function () {
    	console.log("in loading data function");

        var result;
    	var maxLat=51.53363,
		    minLon=-0.13596,
		    maxLon=-0.11205,
		    minLat=51.51932;

    	var callbackCalled = false;
    	var mapResult;
    	rnib.mapData.registerDataLoadedCallback(function dataLoaded(map) {
    		callbackCalled = true;
    		mapResult = map;
    	});
    	rnib.mapData.loadDataFor(minLon, minLat, maxLon, maxLat);

    	waitsFor(function() {
			console.log("loading data called-back");
			return callbackCalled;
		}, "Loading data timed-out.", 2000);

        it("should not be null", function () {
			expect(mapResult).not.toBeNull();
        });

        it("should find a contained node ID", function () {
			var n1 = rnib.mapData.getNodeById("108417");
			expect(n1).not.toBeNull();
        });

        it("should not find an absent node ID", function () {
			var n1 = rnib.mapData.getNodeById("99999");
			expect(n1).toBeUndefined();
        });

        it("should give non-null ways on the contained node ID", function () {
        	var n1 = rnib.mapData.getNodeById("108417");
			var n1Ways = n1.getWays();
			expect(n1Ways).not.toBeNull();
			console.log("n1Ways: "+ n1Ways);
        });

        it("should include a known name on the way on the contained node ID", function () {
        	var n1 = rnib.mapData.getNodeById("108417");
			var n1Ways = n1.getWays();
			var w1 = n1Ways[0];
			expect(w1.name).toEqual("Old Street");
        });

        it("should find non-null node near a known location", function () {
        	var lat0 = 51.52454555500299;
        	var lon0 = -0.09877452626824379;
        	var n1 = rnib.mapData.getNodeNearestLatLon(lat0, lon0);
        	expect(n1).not.toBeNull();
        });

        it("should find a way near a known location", function () {
        	var lat0 = 51.52454555500299;
        	var lon0 = -0.09877452626824379;
        	var n1 = rnib.mapData.getNodeNearestLatLon(lat0, lon0);
        	var n1Ways = n1.getWays();
			expect(n1Ways).not.toBeNull();
        });

        it("should find the expected way near a known location", function () {
        	var lat0 = 51.52454555500299;
        	var lon0 = -0.09877452626824379;
        	var n1 = rnib.mapData.getNodeNearestLatLon(lat0, lon0);
        	var n1Ways = n1.getWays();
			var w1 = n1Ways[0];
			expect(w1.name).toEqual("Clerkenwell and Bunhill Wards Police Station");
        });
    });

});