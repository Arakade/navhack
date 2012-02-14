(function(exports, $, undefined){

    var that = this;
    var module = {};

    var map = null;
    var nodes = {};
    var nodesToWays = {};
    var bounds;

    var dataLoadedCallback;

    module.registerDataLoadedCallback = function(newCallback) {
    	dataLoadedCallback = newCallback;
    }

  module.loadDataFor = function(minLon, minLat, maxLon, maxLat) {
	  callback =
      jQuery.ajax({
          url: "data/map.xml",
      dataType: "xml",
          success : onMapLoaded,
          error: onGetMapDataError,
          timeout : 100000
      });
  };

  function onGetMapDataError(err) {
	  console.log("mapDataLoadError: "+ err.statusText)
	  alert("onGetMapDataError: "+ err.statusText);
  }

  /** Record loaded data into our internal datastructures. */
  function onMapLoaded(map) {
      module.map = map;

      bounds = $(map).find("bounds");

	  var closestNodeRef;
	  var c1 = 0;
	  $(map).find("node").each(function(i, n) {
		  var key = $(n).attr("id");
		  nodes[key] = n;
		  c1 = i;
	  });
	  console.log("last node processed: "+ c1);

	  var c2 = 0;
	  $(map).find("way").each(function(i, w) {
		  var goodWay = buildWayIfNamed(w);
		  if (goodWay) {
			  $(w).find("nd").each(function(i, nd) {
		    		  var node = $(nd).attr("ref");
		    		  if (!nodesToWays[node]) {
		    			  nodesToWays[node] = new Array();
		    		  }
		    		  nodesToWays[node].push(goodWay);
		    	  });
			  c2 = i;
		  }
	  });

	  console.log("last way processed: "+ c2 +", calling dataLoadedCallback");

	  dataLoadedCallback(map);
  }

  module.getNodeNearestLatLon = function(lat, lon) {
	  var d = 9999999999999;
	  var node;
	  nodes.each(function(i, n){
          var lat2 = rnib.distances.Lat(n);
          var lon2 = rnib.distances.Lon(n);
          var dx = (lat1 - lat2);
          var dy = (lon1 - lon2);
          var ds = dx * dx + dy * dy;
          if (ds < d) {
              d = ds;
              node = n;
          }
      });
	  return new GoodNode(node);
  }

  module.getNodeById = function(id) {
	  return new GoodNode(nodes[id]);
  }

  function getWaysByNode(id) {
	  return nodesToWays[id];
  }

  function GoodNode(node){
      this.node = node;
      this.id = $(node).attr("id");

      this.getWays = function() {
    	  return getWaysByNode(this.id);
      }
  }

	function GoodWay(src, wayName){
		this.src = src;
		this.name = wayName;
	}

	function buildWayIfNamed(waySource) {
		// var name = $(waySource).find("tag[k='name']")[0].attr("v");
		var names = $(waySource).find("tag[k='name']");
		if (!names || 0 == names.size()) {
			return null;
		}

		var name = $(names[0]).attr("v");
		if (name) {
			return new GoodWay(waySource, name);
		} else {
			return null;
		}
	}

    exports.rnib = exports.rnib || {};

    exports.rnib.mapData = module;
})(window, jQuery)