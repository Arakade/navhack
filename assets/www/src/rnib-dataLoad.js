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
          url: "src/map.xml",
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
		  var key = n.id;
		  nodes[key] = n;
		  c1 = i;
	  });
	  console.log("last node processed: "+ c1);

	  var c2 = 0;
	  $(map).find("way").each(function(i, w) {
		  $(w).find("nd").each(function(i, nd) {
	    		  var node = nd.ref;
	    		  if (!nodesToWays[node]) {
	    			  nodesToWays[node] = new Array();
	    		  }
	    		  nodesToWays[node].push(nd);
	    	  });
		  	  c2 = i;
	      });

	  console.log("last way processed: "+ c2 +", calling dataLoadedCallback");

	  dataLoadedCallback(map);
  }

  module.getNodeById = function(id) {
	  return nodes[id];
  }

  module.getWaysByNode = function(id) {
	  return nodesToWays[id];
  }

    exports.rnib = exports.rnib || {};

    exports.rnib.mapData = module;
})(window, jQuery)