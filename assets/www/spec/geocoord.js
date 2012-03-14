describe("GeoCoord", function() {
	var currentPos = new rnib.geo.GeoCoord(0, 0);
	var targetPos = new rnib.geo.GeoCoord(3, 4);

	it("should calculate the distance correctly", function() {
		var distance = currentPos.distanceTo(targetPos);
		expect(distance).toBeCloseTo(555.81, 0.01);
	});

	it("should calculate the bearing correctly", function() {
		var bearing = currentPos.bearingTo(targetPos);
		expect(bearing).toBeCloseTo(53.08, 0.1);
	});
});

describe("Degrees to compass", function() {
	var bearing = 90;

	it("should convert bearings to compass directions", function() {
		expect(rnib.GeoCodeCalc.toCompass(bearing)).toBe("E");
	});
});

describe("Degrees to clock", function() {
	var bearing = 90;

	it("should convert bearings to clock directions", function() {
		expect(rnib.GeoCodeCalc.toClock(bearing)).toBe("3 o'clock");
	});
});
