describe("FindResultsModule FindResults", function() {
	var FindResultsModule = rnib.location.FindResultsModule;

	// Mock fixture dependencies
	var GeoModule = rnib.geo;
	var PlaceModule = rnib.location.PlaceModule;
	var POIModule = rnib.location.POIModule;
	var LocationModule = rnib.location.LocationModule;
	var MockPlace = function MockPlace(id){
		this.id = id;
		this.equals = function(other) {
			return this.id === other.id;
		};
		this.toString = function() {
			return "MockPlace(" + this.id + ")";
		};
	};
	MockPlace.prototype = new PlaceModule.Place();
	var mockLocation = new LocationModule.Location();
	mockLocation.toString = function() {
		return "MockLocation";
	};
	var mockGeoCoord = new GeoModule.GeoCoord();
	mockGeoCoord.toString = function() {
		return "MockGeoCoord";
	};

	// Mock fixtures
	var mockPOI1 = new POIModule.POI(new MockPlace(1), mockLocation, mockGeoCoord);
	var mockPOI2 = new POIModule.POI(new MockPlace(2), mockLocation, mockGeoCoord);
	var mockPOI3 = new POIModule.POI(new MockPlace(3), mockLocation, mockGeoCoord);
	var allPOIs = [mockPOI1, mockPOI2, mockPOI3];

	describe("instantiation", function() {
		describe("with valid inputs", function() {
			it("should not be null", function() {
				var results = new FindResultsModule.FindResults(mockPOI1, allPOIs);
				expect(results).not.toBeNull();
			});
			it("should be correct type", function() {
				var results = new FindResultsModule.FindResults(mockPOI1, allPOIs);
				expect(results instanceof FindResultsModule.FindResults).toBeTruthy();
			});
			it("should expose closestPOI correctly", function() {
				var results = new FindResultsModule.FindResults(mockPOI1, allPOIs);
				expect(results.closestPOI).toBe(mockPOI1);
			});
			it("should expose POIs correctly", function() {
				var mockPOI4 = new POIModule.POI(new MockPlace(4), mockLocation, mockGeoCoord);
				var results = new FindResultsModule.FindResults(mockPOI4, allPOIs);
				expect(results.POIs).toBe(allPOIs);
			});
		});

		describe("should throw error", function() {
			it("when not given any input", function() {
				expect(function() {return new FindResultsModule.FindResults();}).toThrow(new Error("Must supply closestPOI and POIs.  Got (closestPOI:undefined, POIs:undefined)"));
			});

			describe("when null passed for", function() {
				it("all arguments", function() {
					expect(function() {return new FindResultsModule.FindResults(null, null);}).toThrow(new Error("Must supply closestPOI and POIs.  Got (closestPOI:null, POIs:null)"));
				});
				it("1st argument", function() {
					expect(function() {return new FindResultsModule.FindResults(null, "ignored");}).toThrow(new Error("Must supply closestPOI and POIs.  Got (closestPOI:null, POIs:ignored)"));
				});
				it("2nd argument", function() {
					expect(function() {return new FindResultsModule.FindResults("ignored", null);}).toThrow(new Error("Must supply closestPOI and POIs.  Got (closestPOI:ignored, POIs:null)"));
				});
			});

			describe("when passed the wrong type for", function() {
				it("1st argument", function() {
					expect(function() {return new FindResultsModule.FindResults("not a Place", allPOIs);}).toThrow(new Error("Incorrect type(s) closestPOI:POI, POIs:POI[].  Got (closestPOI:String, POIs:Array)"));
				});
				it("2nd argument, instead getting a String", function() {
					expect(function() {return new FindResultsModule.FindResults(mockPOI1, "not a list of POIs");}).toThrow(new Error("Incorrect type(s) closestPOI:POI, POIs:POI[].  Got (closestPOI:POI, POIs:String)"));
				});
				it("2nd argument, instead getting an array of Strings", function() {
					expect(function() {return new FindResultsModule.FindResults(mockPOI1, ["an array of not POIs", "with a 2nd element"]);}).toThrow(new Error("Incorrect POIs array type.  POI[1]:String (checking backwards)"));
				});
			});
		});
	});

	describe("should remove closestPOI from POIs correctly", function() {
		it("when target at start of list", function() {
			var results = new FindResultsModule.FindResults(mockPOI1, allPOIs);
			expect(results.POIs).toEqual([mockPOI2, mockPOI3]);
		});
		it("when target in middle of list", function() {
			var results = new FindResultsModule.FindResults(mockPOI2, allPOIs);
			expect(results.POIs).toEqual([mockPOI1, mockPOI3]);
		});
		it("when target at end of list", function() {
			var results = new FindResultsModule.FindResults(mockPOI3, allPOIs);
			expect(results.POIs).toEqual([mockPOI1, mockPOI2]);
		});
		it("when target not present in list", function() {
			var mockPOI4 = new POIModule.POI(new MockPlace(4), mockLocation, mockGeoCoord);
			var results = new FindResultsModule.FindResults(mockPOI4, allPOIs);
			expect(results.POIs).toEqual(allPOIs);
		});
		it("when there are no POIs", function() {
			var results = new FindResultsModule.FindResults(mockPOI1, []);
			expect(results.POIs).toEqual([]);
		});
		it("when there is only 1 POI", function() {
			var results = new FindResultsModule.FindResults(mockPOI1, [mockPOI1]);
			expect(results.POIs).toEqual([]);
		});
	});
});
