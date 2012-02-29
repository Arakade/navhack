function makeFakeGPSDatum(lat, lon) {
	return {
		coords:{
			latitude: lat,
			longitude: lon
		}
	};
}

describe("PosPoller", function() {
	describe("farAndLongEnough", function() {
		it("should disallow zero distance", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(0, 0);
			var whenA = new Date(0), whenB = new Date(); // now = ages from epoch

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(false);
		});

		it("should disallow zero time", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(99, 99);
			var whenA = new Date(0), whenB = new Date(0);

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(false);
		});

		it("should disallow short distance", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(0.0001, 0);
			var whenA = new Date(0), whenB = new Date(); // now = ages from epoch

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(false);
		});

		it("should disallow short time", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(99, 99);
			var whenA = new Date(0), whenB = new Date(0); whenB.setSeconds(9);

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(false);
		});

		it("should allow enormous time and distance", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(99, 99);
			var whenA = new Date(0), whenB = new Date(); // now = ages from epoch

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(true);
		});

		it("should allow reasonable time and distance", function() {
			var posPoller = new rnib.posPoller.PosPoller();

			var gpsA = makeFakeGPSDatum(0, 0), gpsB = makeFakeGPSDatum(0.001, 0);
			var whenA = new Date(0), whenB = new Date(0); whenB.setSeconds(12);

			expect(posPoller.farAndLongEnough(gpsA, whenA)).toBe(false);
			expect(posPoller.farAndLongEnough(gpsB, whenB)).toBe(true);
		});
	});
});
