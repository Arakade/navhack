describe("Location", function() {
	var LocationModule = rnib.location.LocationModule;
	var log = console;

	describe("equals", function() {
		it("should return true when id values match", function() {
			var a = new LocationModule.Location();
			a.id = "12345";

			var b = new LocationModule.Location();
			b.id = "12345";

			expect(a.equals(b)).toBeTruthy();
		});
		it("should return false when id values do not match", function() {
			var a = new LocationModule.Location();
			a.id = "12345";

			var b = new LocationModule.Location();
			b.id = "56789";

			expect(a.equals(b)).not.toBeTruthy();
		});
	});
});
