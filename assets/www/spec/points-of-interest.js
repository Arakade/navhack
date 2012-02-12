describe("Points of interest finder", function () {
    var pOfIFinder,
        currentLocation = new rnib.poi.GeoCoord(78, 99);

    beforeEach(function () {
        pOfIFinder = new rnib.poi.PointsOfInterestFinder();
    });

    describe("retrieving points of interest", function () {


        it("should return an array with the points of interest in it", function () {
            var results = pOfIFinder.getPointsOfInterest(currentLocation, 20);
            var expectedPOI = new rnib.poi.PointOfInterest(new rnib.poi.GeoCoord(12.10101, 78.565), "some location")

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