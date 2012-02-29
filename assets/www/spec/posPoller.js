describe("PosPoller", function() {
	describe("farAndLongEnough", function() {
		function makeFakeGPSDatum(lat, lon) {
			return {
				coords:{
					latitude: lat,
					longitude: lon
				}
			};
		}

		it("should disallow zero distance", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(0, 0);
			var when = new Date(); // now = ages from epoch

			expect(pp.farAndLongEnough(pos, when)).toBe(false);
		});

		it("should disallow zero time", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(99, 99);
			var when = new Date(0);

			expect(pp.farAndLongEnough(pos, when)).toBe(false);
		});

		it("should disallow short distance", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(0.0001, 0);
			var when = new Date(); // now = ages from epoch

			expect(pp.farAndLongEnough(pos, when)).toBe(false);
		});

		it("should disallow short time", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(99, 99);
			var when = new Date(0); when.setSeconds(9);

			expect(pp.farAndLongEnough(pos, when)).toBe(false);
		});

		it("should allow enormous time and distance", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(99, 99);
			var when = new Date(); // now = ages from epoch

			expect(pp.farAndLongEnough(pos, when)).toBe(true);
		});

		it("should allow reasonable time and distance", function() {
			var pp = new rnib.posPoller.PosPoller();

			var pos = makeFakeGPSDatum(0.001, 0);
			var when = new Date(0); when.setSeconds(12);

			expect(pp.farAndLongEnough(pos, when)).toBe(true);
		});
	});
});
