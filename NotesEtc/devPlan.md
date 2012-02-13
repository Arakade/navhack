# Areas to consider

1.	Short-term development plan
1.	Potential data sources
1.	Server use discussion
1.	Client-side technology discussion

# Short term development plan

1.	Get basic version of existing code working on Android:
	1.	DONE: Tidyup
	1.	DONE: Get basics of what we had working OK
	1.	Get speech working consistently
	1.	Speak pre-canned relevant proximal POI data
	1.	Load POI data from server.
	1.	...
1.	Consider moving data manipulation to server.
	(see "server use discussion" section for more details)

# Potential data sources

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

*	bounds
	*	Lat+Long bounds of these XML data.
*	nodes = geographic points
	*	Mostly these are geographical points _but lack other semantic data (TBC)_.
	*	_Some_ have names, etc.
*	ways = Roads, etc
	*	Some have name (e.g. of the road they represent)
	*	Defined as 2+ nodes.
*	relations
	*	define things like bus routes.  Unused by us at this time.

# Server use discussion

Intend to process data sources on a server and make these available to the client(s) in a consistent API and data format (at least as far as possible).
Will need to provide it for offline use.
If we end up using a JavaScript-based client, we may consider using NodeJS on the server.

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

### PhoneGap tech investigations

Speaking undisplayed text on iOS
[From native code](http://arstechnica.com/apple/guides/2010/02/iphone-voiceservices-looking-under-the-hood.ars/)


# Dev notes

## Code overview

*	`rnib.poi` (in `src/rnib-hack.js`) provides:
	*	`rnib.poi.PointsOfInterestFinder` class which provides:
		*	`getPointsOfInterest()`
		*	`getCurrentLocation()`
	*	`rnib.poi.GeoCoord` class which provides:
		*	`bearingTo()`
		*	`distanceTo()`
*	TODO: (middle layer)
	*	find nearest way to a lat+long
*	`rnib.mapData` (`src/dataLoad.js`) Provides data loading and retrieval
	*	`registerDataLoadedCallback()`
	*	`loadDataFor(lat-long-rect)`
	*	`getNodeById()`
	*	`getWaysByNode()`
	*	TODO: `findNodeThat(filterFunction)`

`PointsOfInterestFinder` has good API but needs ...?
Give lat + long.  Find nearest node on a way.  That node will hopefully have a name which is the street you're on.
1.	Go through all nodes, find least distant.
1.	Once found, retrieve ways for this node.

