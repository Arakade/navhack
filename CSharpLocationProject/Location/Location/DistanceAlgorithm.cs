using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Location
{
    class DistanceAlgorithm
    {
        const double PIx = 3.141592653589793;
        const double RADIO = 6371; // 6378.16;

        /// <summary>
        /// This class cannot be instantiated.
        /// </summary>
        private DistanceAlgorithm() { }

        /// <summary>
        /// Convert degrees to Radians
        /// </summary>
        /// <param name="x">Degrees</param>
        /// <returns>The equivalent in radians</returns>
        public static double Radians(double x)
        {
            return x * PIx / 180;
        }

        /// <summary>
        /// Calculate the distance between two places.
        /// </summary>
        /// <param name="lon1"></param>
        /// <param name="lat1"></param>
        /// <param name="lon2"></param>
        /// <param name="lat2"></param>
        /// <returns></returns>
        public static double DistanceBetweenPlaces(
            double lon1,
            double lat1,
            double lon2,
            double lat2)
        {
            double dlon = lon2 - lon1;
            double dlat = lat2 - lat1;

            // Suggested correction in comment on StackOverflow
            // double dlon = Radians(lon2 - lon1);
            // double dlat = Radians(lat2 - lat1);

            double a = (Math.Sin(dlat / 2) * Math.Sin(dlat / 2)) + Math.Cos(lat1) * Math.Cos(lat2) * (Math.Sin(dlon / 2) * Math.Sin(dlon / 2));
            double angle = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            // return angle * RADIO;
            return angle * RADIO;
        }

        public static double Degrees(double x)
        {
            return x * 180 / PIx;
        }

        /// <summary>
        /// Calculates the distance between two points of latitude and longitude.
        /// Great Link - http://www.movable-type.co.uk/scripts/latlong.html
        /// </summary>
        public static Double Distance(double lat1, double lon1, double lat2, double lon2) // , UnitsOfLength unitsOfLength
        {
            var theta = lon1 - lon2;
            var distance = Math.Sin(Radians(lat1)) * Math.Sin(Radians(lat2)) +
                Math.Cos(Radians(lat1)) * Math.Cos(Radians(lat2)) *
                Math.Cos(Radians(theta));

            distance = Math.Acos(distance);
            distance = Degrees(distance);
            distance = distance * 60 *1.1515;

            /*
            if (unitsOfLength == UnitsOfLength.Kilometer)
                distance = distance * _MilesToKilometers;
            else if (unitsOfLength == UnitsOfLength.NauticalMiles)
                distance = distance * _MilesToNautical;
            */
            return distance;
        }
    }
}
