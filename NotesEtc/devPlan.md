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




