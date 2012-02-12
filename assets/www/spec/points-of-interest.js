describe("Points of interest finder", function () {
    var pOfIFinder,
        server = sinon.fakeServer.create(),
        currentLocation = new rnib.poi.GeoCoord(78, 99);

    beforeEach(function () {
        // http://www.openstreetmap.org/api/0.6/map?bbox={0},{1},{2},{3}
        // we need to fake out our response here by loading in the xml file
        var response = [200, { "Content-Type": "text/html", "Content-Length": 2 }, "OK"];

        server.respondWith(response);

        pOfIFinder = new rnib.poi.PointsOfInterestFinder();


    });

    describe("retrieving points of interest", function () {
        it("should return an array with the points of interest in it", function () {
            var results,
                callback = function(result){ results = result; },
                expectedPOI = new rnib.poi.PointOfInterest(new rnib.poi.GeoCoord(12.10101, 78.565), "some location");

            pOfIFinder.getPointsOfInterest(currentLocation, 20, callback);

            server.respond();

            expect(results).toContain(expectedPOI);
        });
    });

    describe("getting the friendly name of the current location", function () {
        it("should return the friendly name", function () {
            var result = pOfIFinder.getCurrentLocation(currentLocation);

            expect(result).toBe("Goswell Road");
        });
    });
});