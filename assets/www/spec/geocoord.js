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
	it("should convert 90 degrees to 3 o'clock", function() {
		expect(rnib.GeoCodeCalc.toClock(90)).toBe("3 o'clock");
	});
	it("should convert 180 degrees to 6 o'clock", function() {
		expect(rnib.GeoCodeCalc.toClock(180)).toBe("6 o'clock");
	});
	it("should convert 270 degrees to 9 o'clock", function() {
		expect(rnib.GeoCodeCalc.toClock(270)).toBe("9 o'clock");
	});

	describe("should convert to 12 o'clock", function() {
		it("0 degrees", function() {
			expect(rnib.GeoCodeCalc.toClock(0)).toBe("12 o'clock");
		});
		it("14 degrees", function() {
			expect(rnib.GeoCodeCalc.toClock(14)).toBe("12 o'clock");
		});
		it("-14 (346) degrees", function() {
			expect(rnib.GeoCodeCalc.toClock(346)).toBe("12 o'clock");
		});
	});

});
