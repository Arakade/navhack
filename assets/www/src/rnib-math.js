(function (exports, undefined) {

    var module = {};

    var RADIO = 6371; // 6378.16;

    module.Radians = function (x) {
        return x * Math.PI / 180;
    };

    module.DistanceBetweenPlaces = function (lon1, lat1, lon2, lat2) {
        var dlon = lon2 - lon1;
        var dlat = lat2 - lat1;

        var a = (Math.sin((dlat / 2) * Math.sin(dlat / 2)) + Math.cos(lat1) * Math.cos(lat2) * (Math.sin(dlon / 2) * Math.sin(dlon / 2)));

        var angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return angle * RADIO;
    }

    module.Degrees = function (x) {
        return x * 180 / Math.PI;
    }

    module.Distance = function (lat1, lon1, lat2, lon2)
    {
        var theta = lon1 - lon2;
        var distance = Math.sin(module.Radians(lat1)) * Math.sin(module.Radians(lat2)) +
            Math.cos(module.Radians(lat1)) * Math.cos(module.Radians(lat2)) *
                Math.cos(module.Radians(theta));

        distance = Math.acos(distance);
        distance = module.Degrees(distance);
        distance = distance * 60 * 1.1515;

        return distance;
    }

    module.Lat = function(node) {
                return parseFloat($(node).attr("lat"));
            };

    module.Lon = function (node) {
                return parseFloat($(node).attr("lon"));
            };

    module.Angle = function (element1, element2)
    {
        var lat1 = module.Lat(element1);
        var lon1 = module.Lon(element1);
        var lat2 = module.Lat(element2);
        var lon2 = module.Lon(element2);

        var x = lon1 - lon2;
        var y = lat1 - lat2;

        var a = 90 + -180 / Math.PI * Math.atan2(x, y);
        if (a < 0)
            a += 360;
        return a;
    }

    exports.rnib = exports.rnib || {};

    exports.rnib.distances = module;

})(window, undefined);