describe("Way", function() {
	var WayModule = rnib.location.WayModule;
	var log = console;

	describe("equals", function() {
		it("should return true when id values match", function() {
			var a = new WayModule.Way();
			a.id = "12345";

			var b = new WayModule.Way();
			b.id = "12345";

			expect(a.equals(b)).toBeTruthy();
		});
		it("should return false when id values do not match", function() {
			var a = new WayModule.Way();
			a.id = "12345";

			var b = new WayModule.Way();
			b.id = "56789";

			expect(a.equals(b)).not.toBeTruthy();
		});
	});
});
