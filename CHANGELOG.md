# Mon Aug 28 07:48:06 UTC 2017

* Endscreen for playables support
* MRAID url redirects for app store
* Platform parameter to operative events

# Fri Aug 25 07:57:13 UTC 2017

* MRAID loading fix
* Include user agent in diagnostic messages
* Refactoring for the upcoming 2.1.1 release

# Tue Aug 22 12:41:29 UTC 2017

* Fix non-cached playables on iOS SDK 2.1.0

# Mon Aug 21 12:07:58 UTC 2017

* Loading screen for selected Unity made playables
* Refactored yield based tests to use auction
* Fix DOMParser on Android 4.*
* Add AliBabaCloud purge script

# Thu Aug 17 07:56:14 UTC 2017

* Fix iOS endscreen in portrait mode (ABT-219)
* Test disabling portrait videos on groups 6 and 7
* Stop adaptive caching test on groups 6 and 7

# Wed Aug 16 12:47:19 UTC 2017

* Add meta field to operative events if comet has returned the value
* Refactor VideoInfo API handling to a new utility class
* Remove old MasterClass campaign hacks

# Thu Aug 10 08:57:51 UTC 2017

* Add support for analytics events from playables
* Prevent multiple video player errors from one ad unit

# Wed Aug  9 08:40:17 UTC 2017

* Adaptive caching test with 0,5MB/s limit on groups 6 and 7
* Fix some video player diagnostic problems

# Tue Aug  8 09:33:22 UTC 2017

* Remove endscreen test from groups 8, 9, 10 and 11
* Log all activity and viewcontroller events to video_player_stuck diagnostics
* Fix cropping issue on iOS with MRAID
* Remove video_player_prepare_not_called diagnostic message

# Mon Aug  7 08:03:45 UTC 2017

* Handle errors by placement with PLC ad plans
* Remove unused UI styles
* Fix MRAID parsing
* Yet another fix for iOS video player stuck problems

# Thu Aug  3 16:05:47 UTC 2017

* Fix VAST campaign expiration
* Fix a race condition with iOS video preparing and system events

# Thu Aug  3 09:26:02 UTC 2017

* Modify auction ad plan expiration to match old yield ad plan expiration
* Add logging of system events to iOS video_player_stuck diagnostics
* Remove multiple_plc_campaigns diagnostic message

# Tue Aug  1 13:08:27 UTC 2017

* Endscreen download button A/B test in groups 8, 9, 10 and 11
* Fix for some iOS video_player_stuck cases
* Improved video_validation_failed diagnostics
* Send multiple_plc_campaigns whenever SDK receives different kinds of fill to different placements

# Tue Jul 25 06:44:19 UTC 2017

* Trigger mraid viewableChange event on system pause and resume
* Follow redirects if clickAttributionUrlFollowsRedirects is true on MRAID campaigns
* Fix some video_player_stuck errors

# Tue Jul 18 10:07:39 UTC 2017

* Remove A/B tests for groups 6, 7 (refresh intervals) & 13 (adaptive caching)

# Fri Jul 14 08:59:40 UTC 2017

* CPI MRAID click attribution url was not fired (ABT-255)

# Wed Jul 12 12:43:02 UTC 2017

* Test adaptive caching on A/B group 13

# Wed Jul 12 09:10:06 UTC 2017

* VAST companion tracking
* Stop sending errors for properly stopped caching
* Send diagnostic error if game is not enabled in config response

# Mon Jul 10 06:56:26 UTC 2017

* Catch a few different init errors instead of failing entire init
* Add low memory warning detection to video_player_stuck diagnostic events

# Thu Jul  6 14:00:44 UTC 2017

* Endscreen ratings fix
* Improve video_player_stuck diagnostics

# Thu Jul  6 07:20:34 UTC 2017

* Add bundleId to video events
* Increase test delay to two seconds in A/B group 6

# Wed Jul  5 09:48:21 UTC 2017

* Refactored AssetManager and CampaignManager to support parsing and caching multiple campaigns asynchronously
* Add new fields to video_player_stuck diagnostics
* Add new 2.1.0 client object fields to diagnostic messages

# Mon Jul  3 12:48:21 UTC 2017

* Revert test in group 7 back to exponential increase of refresh interval
* Fix strange reference to event global in end screen event handler

# Mon Jul  3 09:30:10 UTC 2017

* Try linear increasing of refresh interval in group 7
* Start A/B test with 1 second refresh after start in A/B group 6
* Add allowSkip parameter to auction ad requests

# Thu Jun 29 12:47:41 UTC 2017

* Reduce quick no fill refresh test initial delay to one minute

# Thu Jun 29 09:09:31 UTC 2017

* Add values sent via operative events for brand auction
* Update to TypeScript 2.4
* Update dependencies
* Document previousPlacementId and cachedCampaigns
* Fix unhandled promise rejections

# Wed Jun 28 08:35:39 UTC 2017

* Start quick no fill refresh A/B test on group 7

# Tue Jun 27 10:35:11 UTC 2017

* Refactored campaign managers to separate classes
* Removed negative targeting events
* Add JS workarounds for hybrid test runner

# Wed Jun 21 13:37:03 UTC 2017

* Programmatic MRAID support for Auction
* Namespaced diagnostics messages
* Various new parameters to operative events related to oriented videos

# Mon Jun 19 12:02:30 UTC 2017

* Fix cache bookkeeping errors
* Enable earlier ad requests for all users

# Wed Jun 14 14:16:35 UTC 2017

* Catch all errors from cache cleaning to avoid init failures

# Wed Jun 14 13:22:49 UTC 2017

* Redeployment of previous deploy after revert
* Add more information to cache_desync_failure and cache_desync_fixed diagnostics
* Add hack for iOS older than 2.1.0 to avoid most cache desync issues

# Wed Jun 14 08:23:35 UTC 2017

* Send an array of cached campaigns in device cache in cachedCampaigns array in ad requests
* Send third quartile event after 3/4 of playback on MRAID playable ads
* Test for refreshing ads five seconds after start event instead of when going to endscreen in A/B groups 6 and 7

# Tue Jun 13 10:28:55 UTC 2017

* Support for oriented performance campaigns
* Remove Yodo1 A/B test

# Mon Jun 12 08:30:19 UTC 2017

* Start sending cache diagnostics to ads.sdk2.events.creativedownload.json for 1 user out of 10000
* Fix a race condition with operative event retries that might have sent them twice during 20 second race window (ABT-129)
* Programmatic VAST support for auction

# Wed Jun  7 07:34:12 UTC 2017

* Yodo1 A/B test with low quality videos on A/B groups 6 and 7, only for Yodo1 game IDs

# Tue Jun  6 08:16:14 UTC 2017

* Add gameSessionId and previousPlacementId parameters to ad requests, video events and click events
* Option to force orientation with test metadata
* Add names to all models to improve diagnostic errors
* Set no fill when receiving a campaign without gamerId (does not apply to PLC campaigns)

# Fri Jun  2 09:10:17 UTC 2017

* Support for auction v4, includes placement level ad types

# Thu Jun  1 07:36:31 UTC 2017

* Support cache pausing and unpausing with custom metadata flags

# Tue May 30 11:04:37 UTC 2017

* Refresh screenWidth and screenHeight on access
* Validate above values as integers instead of JS numbers

# Tue May 23 08:56:18 UTC 2017

* CampaignRefreshManager placement state race condition fix

# Thu May 18 08:32:22 UTC 2017

* Fix cache redirection support for more than one redirect

# Tue May 16 10:49:04 UTC 2017

* Fix negative targeting event topic name

# Tue May 16 08:10:53 UTC 2017

* Prevent a single ad unit from sending multiple click and click attribution events
* Start sending negative targeting events to Kafka if an advertised game is already installed on the device

# Fri May 12 12:04:09 UTC 2017

* Fix a racing condition when caching PLC ad plan with two or more campaigns
* Remove unused code for split screen portrait videos

# Fri May 12 09:02:18 UTC 2017

* Fix type error with VAST id
* Allow networkOperator and networkOperatorName to be null
* Report campaign_request_failed and plc_request_failed diagnostic events separately

# Wed May 10 14:43:26 UTC 2017

* Programmatic MRAID support for CrossInstall

# Wed May 10 12:05:57 UTC 2017

* Typed models

# Tue May  9 09:26:30 UTC 2017

* Support auction v3, send properties parameter in ad requests
* Support TypeScript 2.3
* First version of analytics events from Unity Ads SDK, not enabled by default

# Wed May  3 11:10:45 UTC 2017

* Read metadata only after ad unit has been opened to make opening ad unit faster

# Fri Apr 21 09:44:05 UTC 2017

* Remove plc_config_received diagnostic message

# Thu Apr 20 11:26:47 UTC 2017

* Add config request URL with query parameters to plc_config_failure diagnostic message

# Thu Apr 20 10:50:08 UTC 2017

* Disable layout fadeout for brand ads with clickthrough URL
* Fail config request and send diagnostics if gamerId is missing from PLC config response

# Thu Apr 20 08:36:43 UTC 2017

* Refactor campaign refresh logic to CampaignRefreshManager
* Parse each campaign only once when placement level controls are enabled to fix caching race conditions

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

