var GeoCodeCalc = {};
 GeoCodeCalc.EarthRadiusInMiles = 3956.0;
 GeoCodeCalc.EarthRadiusInKilometers = 6367.0;
 GeoCodeCalc.ToRadian = function(v) { return v * (Math.PI / 180);};
 GeoCodeCalc.DiffRadian = function(v1, v2) { 
return GeoCodeCalc.ToRadian(v2) - GeoCodeCalc.ToRadian(v1);
 };
 GeoCodeCalc.CalcDistance = function(lat1, lng1, lat2, lng2, radius) { 
return radius * 2 * Math.asin( Math.min(1, Math.sqrt( ( Math.pow(Math.sin((GeoCodeCalc.DiffRadian(lat1, lat2)) / 2.0), 2.0) + Math.cos(GeoCodeCalc.ToRadian(lat1)) * Math.cos(GeoCodeCalc.ToRadian(lat2)) * Math.pow(Math.sin((GeoCodeCalc.DiffRadian(lng1, lng2)) / 2.0), 2.0) ) ) ) );
 };

GeoCodeCalc.toDegrees = function(r){
    return r * (180/Math.PI);
};

GeoCodeCalc.toCompass = function(degrees){
    var bearings = ["NE", "E", "SE", "S", "SW", "W", "NW", "N"];

    var index = degrees - 22.5;
    if (index < 0)
        index += 360;
    index = parseInt(index / 45);

    return(bearings[index]);
};

GeoCodeCalc.toClock = function(degrees){
    var clockNumber = Math.floor(degrees / 30);

    return clockNumber + " o clock";
};
