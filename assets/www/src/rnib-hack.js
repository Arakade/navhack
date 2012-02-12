(function(exports){
    var module = {};

    module.PointsOfInterestFinder = function(){

        this.getPointsOfInterest = function(location, radiusOfInterest){
            var results = new Array();
            results.push(new module.PointOfInterest(new module.GeoCoord(12.10101, 78.565), "some location"));
            return results;
        }

        this.getCurrentLocation = function(location){
            return "Goswell Road";
        }
    };

    module.PointOfInterest = function(coordinate, name){
        this.coord = coordinate;
        this.name = name;
    };

    module.GeoCoord = function (latitude, longitude){
        this.lat = latitude;
        this.lon = longitude;
    };


    exports.rnib = exports.rnib || {};
    exports.rnib.poi = module;
})(this);