describe("Points of interest finder", function () {
//    var pOfIFinder,
//        server = sinon.fakeServer.create(),
//        currentLocation = new rnib.poi.GeoCoord(78, 99);
//
//    beforeEach(function () {
//        // http://www.openstreetmap.org/api/0.6/map?bbox={0},{1},{2},{3}
//        // we need to fake out our response here by loading in the xml file
//        var response = [200, { "Content-Type": "text/html", "Content-Length": 2 }, "OK"];
//
//        server.respondWith(response);
//
//        pOfIFinder = new rnib.poi.PointsOfInterestFinder();
//    });

    describe("loading data", function () {
        it("should work!", function () {
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
        			console.log("calledback");
        			return callbackCalled;
        		}, "It failed (timeout).", 2000);

        		runs(function() {
        			expect(mapResult).not.toBeNull();
        			// it should have data
        			var d1 = rnib.mapData.getNodeById("207960");
        			expect(d1).not.toBeNull();
        			var d1Ways = d1.getWays();
        			expect(d1Ways).not.toBeNull();
        			console.log("d1Ways: "+ d1Ways);
        		});

        });
    });

//    describe("querying for node XXX", function () {
//        it("should return the node", function () {
//            var result = pOfIFinder.getCurrentLocation(currentLocation);
//
//            expect(result).toBe("Goswell Road");
//        });
//    });

});