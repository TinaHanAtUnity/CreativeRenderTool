# Mon Jan 30 13:59:36 UTC 2017

* Fixed several overlay UX issues 

# Wed Jan 25 09:58:18 UTC 201

* End tablet layout AB test
* Add Chinese new year AB test
* Pause videos on iOS when notification/control center is pulled visible
* Prevent brand ad video errors causing a black screen

# Wed Jan 18 10:39:48 UTC 2017

* New overlay to all groups
* Video errors without progress events will close ad
* VAST events to httpkafka
* Browser build improvements

# Mon Jan 16 11:58:22 UTC 2017

* Revert two emergency fixes because backend is now able to keep up with the load

# Sun Jan 15 14:21:00 UTC 2017

* Emergency fix: disabled all ad request retries to help with backend load

# Sun Jan 15 12:28:00 UTC 2017

* Emergency fix: disabled resending any failed events to help with backend load

# Thu Jan 12 15:41:06 UTC 2017

* Improved layout for large tablets A/B test
* Add optional delay for autoclosing ad units
* Improve deployment scripts

# Wed Jan 11 12:55:17 UTC 2017

* Refactor AdUnit API handling from different ad units to a common utility class

# Tue Jan 10 12:20:51 UTC 2017

* Hide overlay header bar if skip disabled
* Video overlay with icons AB test

# Thu Jan 5 09:25:01 UTC 2017

* Remove xmas theme

# Thu Dec 22 16:34:25 UTC 2016

* Use Travis to work around iOS native 2.0.6 and 2.0.7 releases that used webview master instead of release branches

# Tue Dec 20 10:38:00 UTC 2016

* Flip end screen images to match 1.5 behaviour

# Mon Dec 19 13:33:52 UTC 2016

* Add campaign ID to video_too_long diagnostic message
* Add test option to force a country, campaign or A/B group
* Send only Google Play Advertising ID or Android ID in diagnostic messages, never both
* Add Xmas endscreen to all A/B groups except 8 and 9

# Thu Dec 15 16:46:43 UTC 2016

* Removed Marvel AB test from groups 8-11
* Added christmas theme AB test to groups 8 & 9

# Tue Dec 13 11:49:18 UTC 2016

* Diagnostics message for videos over 40 seconds

# Mon Dec 12 15:55:37 UTC 2016

* Update to TypeScript 2.1.4
* Update dependencies to latest
* Add SDK version to all VAST tracking/impression urls

# Thu Dec  8 15:37:41 UTC 2016

* Optional end screen support for brand ads
* Rating count abbreviation support

# Wed Dec  7 16:48:28 UTC 2016

* Disable fake landscape introduced in 2.0.6 due to iOS native bug
* Marvel Contest of Champions custom animated endscreens (A/B groups from 8 to 11)
* Restore accidentally removed rules for endscreen portrait and landscape image assets

# Wed Nov 30 13:40:07 UTC 2016

* Deploy playable ads to all users except for A/B groups 6 and 7
* Send third quartile event for playable ads to fix server-to-server rewards with playable ads
* Black transparent header and footer bars for video overlay texts on wide screen displays
* Fix overlapping text fields on old Androids
* Minor UI fine tuning

# Tue Nov 29 09:43:32 UTC 2016

* Fix for endcard from previous campaign blocking the next video ad (ABT-87)
* Set no fill on all campaign request errors
* Force caching on all VAST ads

# Thu Nov 24 14:34:58 UTC 2016

* If caching fails due to network error, retry five times with a 10 second delay between retries
* Fix iOS cache retries, previously they never retried if downloading failed due to network error
* Disable hardware acceleration on one Android 4.2 device (ABT-91)

