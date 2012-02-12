(function(exports, $, undefined){

    var that = this;
    var module = {};

    var nearbyRadius = 10;
    var factor = 100000;

    //XDocument map = null;
    var map = null,
        olat,
        olon,
        maxLat,
        minLat,
        maxLon,
        minLon;

    var fileXml;

    module.Tags = function (element) {

                    var dict = {};
                    var parent = $(element);
                    var tags = parent.children("tag");

                    tags.each(function(i, t){
                        dict[$(t).attr("k")] = $(t).attr("k");
                    });

                    return dict;
    };

    module.loadData = function(map) {

        module.map = map;

                        var bounds = $(map).find("bounds"); // query xml document

//                        minLat = double.Parse(bounds.Attribute("minlat").Value);
//                        maxLat = double.Parse(bounds.Attribute("maxlat").Value);
//                        minLon = double.Parse(bounds.Attribute("minlon").Value);
//                        maxLon = double.Parse(bounds.Attribute("maxlon").Value);

        var maxLat=51.53363,
            minLon=-0.13596,
            maxLon=-0.11205,
            minLat=51.51932;

        var d, node, crossings;

                        var lat1 = minLat + (maxLat - minLat) / 2;
                        var lon1 = minLon + (maxLon - minLon) / 2;
                        node = null;
                        d = 9999999999999;
                        crossings = new Array();

        var closestNodeRef,
            nodes = $(map)
                .find("node");

        nodes.each(function(i, n){
            var lat2 = rnib.distances.Lat(n);
            var lon2 = rnib.distances.Lon(n);
            var dx = (lat1 - lat2);
            var dy = (lon1 - lon2);
            var ds = dx * dx + dy * dy;
            if (ds < d)
            {
                d = ds;
                node = n;
            }
        });

        module.findWays($(node));

        closestNodeRef = $(node).attr("id");

        var ways = $(map)
                    .find("way nd[ref='" + closestNodeRef + "']");

        var k = $(ways.parent()
                    .find("tag[k='name']")[0]).attr("v");

        //Move(node);
    }

        module.find = function () {
//            sa = form2.URL.Split(new char[] { '=' });
//            sc = form2.SessionCookie;
//            int ie = sc.IndexOf("=");
//            int isc = sc.IndexOf(";");
//            Cookie session = new Cookie(sc.Substring(0, ie), sc.Substring(0, isc).Substring(ie + 2), null, "www.openstreetmap.org");

//            minLon = double.Parse(LeftOfAmpersand(sa[1]));
//            minLat = double.Parse(LeftOfAmpersand(sa[2]));
//            maxLon = double.Parse(LeftOfAmpersand(sa[3]));
//            maxLat = double.Parse(LeftOfAmpersand(sa[4]));

            var maxLat=51.53363,
                minLon=-0.13596,
                maxLon=-0.11205,
                minLat=51.51932;

            var lat = minLat + (maxLat - minLat) / 2;
            var lon = minLon + (maxLon - minLon) / 2;

            var delta = 0.01;

            minLat = lat - delta / 2;
            maxLat = lat + delta / 2;
            minLon = lon - delta;
            maxLon = lon + delta;

            var formData =
                "maxlat=" + maxLat +"&minlon=" + minLon + "&maxlon=" + maxLon + "&minlat=" + minLat
                + "&format=mapnik&mapnik_format=jpeg&mapnik_scale=14000"
                + "&osmarender_format=png&osmarender_zoom=4&commit=Export";
            module.savePost(minLon, minLat, maxLon, maxLat);
            //LoadData();

        };

    module.WaysFromNode = function(node)
            {
                var id = $(node).attr("id");
                var ways = $(module.map)
                            .find("way nd[ref='" + id + "']")
                            .parent();

//                var ways2 = $(map)
//                    .find("way")
//                    .find("nd[ref='" + id + "']")
//                    .parent();

                return ways;
            }

    module.Nodes = function(way)
            {
                var nodes = new Array();
                for (var e in way.find("nd")){
                    $(map).find("node").each(function(i, x){
                        if ($(x).attr("id") === $(e).attr("ref")){
                            nodes.push(x);
                        }
                    });
                }
                return nodes;
            }

    module.findWays = function(node){

            var index = -1;

            var ways = module.WaysFromNode(node)

            for (var w in ways)
            {
                var s = null;
                var d = null;

                try
                {
                    s += module.Tags(w)["name"];
                }
                catch(err)
                {
                    s += "Unknown";
                };

                var nodes = module.Nodes(w);

                var count = nodes.Count();

                var elements = new Array();

                var i = 0;

                for (var n in nodes)
                {
                    if ($(n).attr("id") == $(node).attr("id"))
                        index = i;
                    elements[i++] = n;
                }
                if (index < count - 1)
                {
                    var a1 = module.Angle(elements[index + 1], node);
                    // d += module.Direction(a1);
                    //listBox1.Items.Add(new Segment(elements[index + 1], s, d, a1, (string)w.Attribute("id")));
                    d = null;
                }
                if (index > 0)
                {
                    var a2 = module.Angle(elements[index - 1], node);
                    //d += module.Direction(a2);
                    //listBox1.Items.Add(new Segment(elements[index - 1], s, d, a2, (string)w.Attribute("id")));
                }
            }
    };

        module.doSave = function (data) {
            // fileXml = data;
            module.loadData(data);
        };

        module.savePost = function (minLon, minLat, maxLon, maxLat) {
            jQuery.ajax({
                url: "src/map.xml",
                dataType: "xml",
                success : module.doSave,
                error: module.onGetMapDataError,
                timeout : 100000
            });

        };

    exports.rnib = exports.rnib || {};

    exports.rnib.openStreetMap = module;
})(window, jQuery)