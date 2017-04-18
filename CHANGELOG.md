# Tue Apr 18 15:11:37 UTC 2017

* Remove Easter theme
* Support auction v2 ad plan format with placement level controls

# Tue Apr 18 11:13:24 UTC 2017

* Add platform to configuration request parameters to fix iOS 10 fingerprinting with placement level controls
* Stop caching when ad is shown

# Mon Apr 10 07:23:56 UTC 2017

* Easter holiday themes
* Add simple diagnostics for placement level control support

# Thu Apr  6 13:30:20 UTC 2017

* Initial support for placement level controls
* Support for Gordon Ramsay MasterClass campaign

# Thu Apr  6 07:38:15 UTC 2017

* Remove .demo from Xiaomi package name
* Remove end screen AB test from groups 8 & 9
* Fix sending duplicate diagnostic events on click attribution error

# Mon Apr 3 07:49:45 UTC 2017

* Fixed skip button animation on Android 4.1.2 (ABT-202)
* End screen AB test with a blank fullscreen card
* AB test of replacing the UnityAds logo with just Unity logo (groups 10 & 11)

# Fri Mar 31 07:02:57 UTC 2017

* Do not allow redirection to https://itunes.apple.com

# Thu Mar 30 09:22:20 UTC 2017

* Orientation & iframe size fixes for playables
* Click attribution fixes

# Wed Mar 29 09:13:44 UTC 2017

* Remove transparent header and footer bars from the video overlay
* Style file clean up

# Mon Mar 27 13:44:09 UTC 2017

* Fix MRAID events
* Update code to be compliant with TypeScript 2.2

# Fri Mar 24 08:52:30 UTC 2017

* When cached video is not found, use the correct video intended for streaming instead of the downloadable video

# Thu Mar 23 15:06:23 UTC 2017

* If cached video is not found when video is starting, use streaming video as fallback
* Revert "Set iframe height and width in pixels based on the screen size."

# Thu Mar 23 05:44:20 UTC 2017

* Add check for showing cached files when they are not found in cache
* Removed Marvel A/B test

# Tue Mar 21 15:05:53 UTC 2017

* MRAID campaign support

# Mon Mar 20 13:06:36 UTC 2017

* Clean cache desyncs in init
* Stop cache cleaning on iOS older than 2.1.0 due to Cache.delete bugs

# Mon Mar 20 09:06:29 UTC 2017

* Added video overlay A/B test to groups 18 & 19
* Init existing placements with WAITING stat

# Tue Mar 14 12:03:13 UTC 2017

* Fix iOS crash (ABT-183)

# Mon Mar 13 14:53:50 UTC 2017

* Trigger click events on MRAID ads

# Mon Mar 13 10:12:09 UTC 2017

* Fix a bug where forced caching treated optional assets (like endscreen assets) as required assets
* Workaround for desync in cached files and cache bookkeeping where SDK tries to resync status with HTTP 416 response
* Add video validation for 2.1

# Fri Mar 10 11:27:36 UTC 2017

* Converted current MZ playables to use MRAID 

# Wed Mar  8 07:19:27 UTC 2017

* Marvel Contest of Champions animated background A/B test

# Thu Mar  2 15:06:13 UTC 2017

* Fix iOS getNetworkOperator and getNetworkOperatorName methods when there is no SIM card present

# Thu Mar  2 09:31:13 UTC 2017

* Add store detection (Google Play/Xiaomi) to ad requests

# Wed Mar  1 13:25:48 UTC 2017

* Remove split screen ad unit A/B test
* Add hit areas for overlay buttons
* Fix campaign request parameters

# Mon Feb 27 13:12:02 UTC 2017

* Fix click attribution
* Simple validation of campaign asset URLs (videos, endscreen images)
* Refactor test metadata fetching

# Wed Feb 22 13:33:10 UTC 2017

* Split screen ad unit A/B test

# Tue Feb 21 11:31:53 UTC 2017

* Send skip event to Kafka instead of comet
* Send frameworkName and frameworkVersion parameters in ad requests and operative events

# Mon Feb 20 10:52:10 UTC 2017

* Restore invocations of iOS setAutomaticallyWaitsToMinimizeStalling API
* Use containers for all AdUnit API invocations
* Send campaign_expired diagnostics only when show fails, not when cleanly refreshing campaigns

# Mon Feb 13 10:40:14 UTC 2017

* New retry policy: never retry 4xx or 5xx error responses

# Fri Feb 10 12:19:06 UTC 2017

* Fixed overlay clicking and scrolling issues

# Thu Feb  9 10:44:10 UTC 2017

* Second deployment of major refactorings, including caching fixes to previous deployment

# Wed Feb  8 07:52:00 UTC 2017

* Revert previous deployment due to serious caching problems that cause no fill

# Tue Feb  7 13:13:11 UTC 2017

* Major refactorings (should improve programmatic caching)

# Mon Feb  6 10:43:02 UTC 2017

* Removed Chinese new year AB test

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

