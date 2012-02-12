function setupServer(server) {
    var rawXML;

    $.ajax(
        {
            url:"/spec/cutdown.xml",
            async:false,
            dataType:"text/plain",
            complete:function (data) {
                rawXML = data;
            }
        });

    server = sinon.fakeServer.create();

    var response = [200, { "Content-Type":"text/html", "Content-Length":2 }, "OK"];

    server.respondWith(response, rawXML.responseText);
    return server;
}

describe("Points of interest finder", function () {
    var pOfIFinder,
        server,
        currentLocation = new rnib.poi.GeoCoord(78, 99);

    beforeEach(function () {
        // http://www.openstreetmap.org/api/0.6/map?bbox={0},{1},{2},{3}
        // we need to fake out our response here by loading in the xml file
        server = setupServer(server);
        pOfIFinder = new rnib.poi.PointsOfInterestFinder();
    });

    afterEach(function(){
        server.restore();
    });

    describe("retrieving points of interest", function () {
        it("should return an array with the points of interest in it", function () {
            var results,
                result,
                callback = function(result){ results = result; },
                expectedPOI = new rnib.poi.PointOfInterest(new rnib.poi.GeoCoord(12.10101, 78.565), "some location");

            pOfIFinder.getPointsOfInterest(currentLocation, 20, callback);

            server.respond();

            result = results[0];

            expect(result.coord.lat).toBe(expectedPOI.coord.lat);
            expect(result.coord.lon).toBe(expectedPOI.coord.lon);
            expect(result.name).toBe(expectedPOI.name);
        });
    });

    describe("getting the friendly name of the current location", function () {
        it("should return the friendly name", function () {
            var result = pOfIFinder.getCurrentLocation(currentLocation);

            expect(result).toBe("Goswell Road");
        });
    });
});