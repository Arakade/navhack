# Areas to consider

1.	Short-term development plan
1.	Potential data sources
1.	Server use discussion
1.	Client-side technology discussion

________________________________

# Short term high-level development plan

(see also detailed dev plan below)

1.	Get basic version of existing code working on Android:
	1.	DONE: Tidyup
	1.	DONE: Get basics of what we had working OK
	1.	DONE: Have updates prompted by change in sufficient time and distance.
	1.	DONE: Get speech working consistently
	1.	DONE: Get current location (road, street, etc) from pre-canned data
	1.	Get relevant proximal POI from pre-canned data
	1.	Add junction behaviour (detect junction and speak options).
	1.	Load data from server.
	1.	Unify code (e.g. `GeoCoord`, `GoodNode`, `rnib-math.js`, `GeoCodeCalc.js`)
	1.	Do a minimal amount of performance optimization?
	1.	Present version to beta-testers
	1.	...
1.	Consider larger re-architecting (change platform, etc)
	1.	Consider alternative client-side platform.
	1.	Consider moving data manipulation to server.
		(see "server use discussion" section for more details)

________________________________

# Data source potentials

*	Map-like
	*	Open Street Map
		*	Original map service used during hackathon.
		*	Pros: Good data; Offline-able.
			*	Cons: Messy?
	*	Ordnance Survey
		*	Pros: Good data
		*	Cons: Awkward API and data; UK-only.
*	People-centric (checkin services)
	*	FourSquare
	*	other checkin services to propose

## Open Street Map

### Data description

[Nodes, Ways, Relations introduction](http://wiki.openstreetmap.org/wiki/Data_Primitives). (_)

*	bounds
	*	Lat+Long bounds of these XML data.
*	nodes = geographic points
	*	Mostly these are geographical points _but lack other semantic data (TBC)_.
	*	_Some_ have names, etc.
*	ways = Roads, walkways, areas, roundabouts, etc
	*	Some have name (e.g. of the road they represent)
	*	Defined as 2+ nodes.
*	relations
	*	define things like bus routes.  Unused by us at this time.

________________________________

# Dev notes

## Classes

(including future classes)

### LocationServiceManager class

*	provides main API for app to do its job.
*	(perhaps adapt `PointsOfInterestFinder` into this)
*	provides a callback interface that periodically provides a `Location` instance with all info for app to work with (see below).
	Likely `LocationServiceManager.registerLocationListener(function locationListener(Location))`
*	a Facade which abstracts single or multiple `LocationProvider`s (e.g. `LocationProviderOSM`).

### LocationProvider class

*	Provider class used by `LocationServiceManager`
*	Given a lat+lon, provides a `Location` in async API (specifically to allow server calls).  Abstracts server calls and caching.
	`LocationProvider.findPlaceNear(GeoCoord, function successCallback(Location), function failureCallback(error))`

### Location class

*	Represents a `Location` that is returned each position update that holds all data for operations.
	Generally has:
	*	info about current location (including nearest 'thing')
	*	set of nearby POIs (TODO: perhaps each POI is/has a `Location`?)
	*	whether at a junction and what choices
	*	later ability to be merged (so `Location`s from multiple `LocationProvicer`s can be combined for supplying to the app.)
*	So `Location` should have:
	*	self info:
		*	`getAName()` gets an arbitrary 'best guess' name
			(for OSM: maybe from a `Node`, probably from an arbitrary `Way`)
		*	Maybe...
			*	_`getTypes()` which returns a list of types for this Location (street, streetPart, building, ...)_
			*	_`getTypeValue(type)` gives the value for the supplied `type` (or null if unknown)_
			*	_`getTypeName(type)` gives the name  for the supplied `type` (or null if no name or unknown type)_
	*	POI info:
		`getPOIList()` which gives `POI`
		*	`POI.getLocation()` to call `.getName()`
		*	`POI.getRange()` distance from providing `Location`
		*	`POI.getBearing()` (in degrees to pass to `GeoCodeCalc.toClock(degrees)` to speak)
	*	junction info:
		*	`isJunction()`
		*	`getJunctionChoices()`
	*	`mergeWith(Location)`
		Merges another `Location` with this one.

## OSMLocationProvider : OSM data loading

(Currently implemented in `rnib-dataLoad.js` but implements the unifying `LocationProvider` interface.)

Algorithm (from Steve):
Given lat + long.  Find nearest node on a way.  That node will hopefully have a name which is the street you're on.

Perhaps better, get all nodes within radius then apply certain filters (e.g. highways).

Algorithm plan:

General technique:

On data load, process loaded data (from XML) into forms that provide fast access for lat+lon requests.
This initially includes categorizing types of data (e.g. places, pointsOnRoads).  Later we'll likely add spatial data-structure and/or persisting our processed version.
First follows a description of the algorithm to do this categorizing:

*	`updateAttributesFrom()` builds `attributes` map from OSM `tag` `k` to `v` for use by other operations.
*	Define 3 (future 4 inc. `relation`s) types of classifier, 1 each for Locations, Ways and both (general cases).  These iterate through `attributes` (and other info on the subject) to take appropriate actions.
	*	general case:
		*	If `visible == false`, skip everything.  TODO: Can also be an attribute on a node (and others?).
	*	`Location` case: _(n.b. do not skip unnamed since needed for way processing.)_
		*	Building:
			*	`building=yes` --> `places`
			*	`addr:housename` or `addr:housenumber`, --> `locationsOnRoads`
		*	Junction:
			*	See [OSM Key:junction](http://wiki.openstreetmap.org/wiki/Key:junction)
				**Note, not always present for junctions (more often not!)**
			*	A junction is also a node shared by multiple road-like ways.  However rather than forcing post-processing, `Location.addToRoad(Way)` does it on-the-fly.
		*	Crossing:
			*	See [OSM Key:crossing](http://wiki.openstreetmap.org/wiki/Key:crossing)
			*	E.g. `crossing="uncontrolled", crossing_ref="zebra", highway="crossing"` (_)
		*	Others TODO:
			*	All items from **[OSM's Category:Visual_Impairment](http://wiki.openstreetmap.org/wiki/Category:Visual_Impairment)** !
			*	Interesting items from OSM's [Keys list](http://wiki.openstreetmap.org/wiki/Category:Keys) and [En:Keys list](http://wiki.openstreetmap.org/wiki/Category:En:Keys)
	*	`Way` case:
		*	If unnamed, skip.
		*	If `isTransportWay(way)`...
			*	See [OSM Key:highway](http://wiki.openstreetmap.org/wiki/Key:highway)
				`highway`: check value and likely treat as road
			*	If true,
				1.	add `Location`s the way references to `locationsOnRoads`.
					Record those ways' names against the node?
					If already on a road, this is a junction!  **TODO:* Calling `Location.addToRoad()` a second time causes junction recording.
				1.	(later rank roads since some more useful to know than others)
		*	Building:
			*	`addr:street` implies building-on-road rather than road itself?
			*	For each member `Location`:
				*	Record in `Location` that is a member of a `Way` (to find later)
				*	Add all `Location`s to --> `locationsOnRoads`
				*	If usefully named, add all `Location`s --> `places`
		*	Others TODO:
			*	All items from **[OSM's Category:Visual_Impairment](http://wiki.openstreetmap.org/wiki/Category:Visual_Impairment)** !
			*	Interesting items from

So algorithm breaks into 2 parts: (1) data-load and (2) on lat+lon request:

1.	On data-load, pre-process all nodes for fast access during lat+lon request:
	1.	Process XML nodes into `Location`s for rest of algorithm including extracting attributes then categorize `Location`s
	1.	Process XML ways into `Way`s including extracting attributes and cross-registering `Way` and `Location` connections then categorize `Way`s (including junction registration).
1.	On lat+lon request:
	1.	Find current place on road:
		1.	Go through all `locationsOnRoads`, find least distant.
		1.	_? Check whether `Location` is a member of a `Way` as a building / road ?_
	1.	Find points of interest:
		1.	Search `places` for being within search radius
		1.	For those found, `Location` will appropriately proxy information from the `Way`.
		1.	De-dup discovered `Location`s:
			1.	by closest proximity (multiple `Location`s from single building might be reported).
			1.	_(In future, might be advised to indicate direction to some 'primary' points rather than merely nearest.  Or calculate centroid for `Way`s `Location`s to determine center rather than point.)_
		1.	Wrap the discovered items in `POI` class to ease relative work.

## Current code overview

### Current modules, classes, etc

*	`rnib.poi` (in `src/rnib-hack.js`) provides:
	*	`rnib.poi.PointsOfInterestFinder` class which provides:
		*	`getPointsOfInterest()`
		*	`getCurrentLocation()`
	*	`rnib.poi.GeoCoord` class which provides:
		*	`bearingTo()`
		*	`distanceTo()`
*	TODO: (middle layer)
	*	find nearest way to a lat+long
*	`rnib.mapData` (`src/rnib-dataLoad.js`) Provides data loading and retrieval
	*	`registerDataLoadedCallback()`
	*	`loadDataFor(lat-long-rect)`
	*	`getNodeNearestLatLon(lat-lon)`: `Location` (see below)
	*	TODO-maybe: `findNodeThat(filterFunction)`

### Current code flow

*	`main.js` creates and starts a `PerUpdate` (`rnib-perUpdate.js`).  It...
	*	registers a `PosPoller` (`rnib-posPoller.js`) to get updated when sufficient time and distance change
	*	receives updated GPS position
	*	Makes AJAX/JSON server call to get current location.  This needs changing to using cached version.
	*	...?
	*	Uses `rnib-dataLoad.js` to convert to:
		*	ways (roads, streets, etc).
		*	TODO: nearby POIs
*

## Reality-Plan gap

In current code, what is closest to above plan?  (`PointOfInterest`, `GoodNode`, ?)

*	`points-of-interest.js` and `rnib-hack.js` (`PointsOfInterestFinder` and `PointOfInterest`) have nice API and will be great for server-mock in future but atm aren't complex enough.
*	`GoodNode` is:
	*	is currently most useful data
	*	heavily tied to OSM data form
	*	tightly integrated with `dataLoad.js` -- needs separating.
	*	currently uses `geo.GeoCoord` from `rnib-geo.js` (not `GeoCodeCalc`)

## PLAN

1.	Refactor `GoodNode` out of `dataLoad.js` to create `Location` class:
	1.	DONE: Refactor `GoodNode` out of `dataLoad.js` (test)
	1.	DONE: Rename to `Location` (test)
	1.	DONE: Call `mapDataModule.getNodeNearestLatLon(lat, lon)` from `perUpdate` instead of AJAX/JSON
	1.	Implement "Data loading" algorithm (above)
	1.	Add extra methods (see above)
	1.	(and the rest!...)
1.	Switch `PointsOfInterestFinder` to working with `Location` and/or `dataLoad.js`?  *or will the updater's needs affect how we do this?*
1.	Switch `geo.GeoCoord` (`rnib-geo.js`) to using `GeoCodeCalc` and exposing appropriate methods.  Perhaps combine the two?

________________________________

# Client-side technology discussion

Proposed options:

1.	PhoneGap for unified client code
1.	Native clients on each platform
1.	MonoDroid
1.	Appcelerator Titanium
1.	(library presented at DroidConUK 2011 that used JS logic and native GUI)

## PhoneGap investigation

Project was begun with PhoneGap during hackathon.
Concerns over sufficiency:

1.	Can one use all gestures (i.e. vertical drag)
1.	Performance?
1.	Developer productivity

### How to speak text on iOS

Specifically undisplayed text.  Perhaps [from native code](http://arstechnica.com/apple/guides/2010/02/iphone-voiceservices-looking-under-the-hood.ars/)?

________________________________

# Server use discussion

Intend to process data sources on a server and make these available to the client(s) in a consistent API and data format (at least as far as possible).
Will need to provide it for offline use.
If we end up using a JavaScript-based client, we may consider using NodeJS on the server.
