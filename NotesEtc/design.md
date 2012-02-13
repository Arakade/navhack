# Scenario inputs

*	On-person cases
	*	In pocket
	*	Out of pocket but fully-blind
	*	Out of pocket and partially sighted
*	Offline cases
	*	Online with good (fast & free) data connection
	*	Online with slow/costly data connection
	*	Offline with data pre-downloaded
	*	Offline with data missing
*	Speed cases
	*	On foot (expected case)
	*	In car.
		(Perhaps this mandates a load a wider range and/or elongated zone?)
	*	At sea?
	*	In plane ("Paris out of the left window!")
*	Environment cases
	*	City
	*	Countryside

# Use cases

1.	Walking down street, all POIs within defined radius of location every period of time.
1.	Arrive at a junction and be told names and directions (by clock face) of exits.
	(How to do compass if in pocket?  Last travel direction?  Require removal from pocket?)

# Configuration choices

*	Subjects of interest
	*	Default/initial: all
	*	Buildings
	*	Businesses
		*	Perhaps narrowed by type (e.g. shops vs. B2B companies' premises)
*	Range of interest
	*	Default/initial: 20m for walking.
	*	Perhaps auto-adjusted by speed case (walking vs. car)
