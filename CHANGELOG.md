# Staged

* Do not use video duration reported in vast xml and use the REAL video duration
* New dark end screen AB test in groups 8 & 9
* Add info button and privacy pop-up to MRAID overlay
* Add isAppForeground to FocusManager

# Thu Dec  7 10:05:11 UTC 2017

* Change comscore ABGroup to check campaign ABGroup
* Fix bugs in orientation detection
* Fix overlay layout on iPhone X

# Tue Dec  5 10:15:34 UTC 2017

* Remove persistent skip button ab test in groups 10 & 11
* Add max value check for playable analytics
* Add session objects for cache diagnostic errors

# Thu Nov 30 10:04:19 UTC 2017

* Fix end screen layout on iPhone X
* Comscore AB test in group 5

# Wed Nov 29 09:17:59 UTC 2017

* Fix MRAID layout on iPhone X
* Dark close button in landscape
* Disable Android hardware acceleration on Android 4.2 devices

# Tue Nov 28 09:12:34 UTC 2017

* Disable nofill retrying test in AB group 5
* Use % for endscreen width and height instead of vh and vw due to ios7 partial support

# Mon Nov 27 09:52:53 UTC 2017

* Add ad request ordinal to session_start_failed diagnostic message
* Run integration tests in separate processes

# Thu Nov 23 10:20:20 UTC 2017

* Stop AB test in groups 8 & 9 - set new end screen to the whole network
* AB test persistent overlay in groups 10 & 11 and enable for selected games
* Add local_time_offset to appRunning analytics events
* Experimental APK redirect feature

# Wed Nov 22 10:28:21 UTC 2017

* Add loading error diagnostic to MOAT integration
* Minor iPhone X layout tweaks
* Minor adjustments to the analytics protocol

# Mon Nov 20 09:36:12 UTC 2017

* Change use of advertiser bundleID to game bundleID for MOAT
* Use more aggressive retrying in A/B group 5
* Remove operative event diagnostics & fix click attribution after first click
* Remove interstitial overlay ab test in groups 12 & 13

# Thu Nov 16 13:37:39 UTC 2017

* Upgrade to TS 2.6 & upgrade all other dependencies
* Reorder regexp to prevent matched string replacement ($&) in build
* New interstitial overlay view with the close button (AB test in groups 12 & 13, enabled directly for selected gameIds)
* Retry refactored end screen AB test (groups 8 & 9)

# Tue Nov 14 09:32:33 UTC 2017

* Faster init by converting some promise chains to be parallel 

# Mon Nov 13 09:23:05 UTC 2017

* Add browser build tests to CI
* Add init time and reinit flag to SDK stats
* Add language parameter to operative events
* Add AB test for quick no fill refresh to group 5
* Adjust endcard button position on iPhoneX

# Thu Nov  9 10:00:00 UTC 2017

* Add safety checks for negative values when sending playable analytics
* Fix most of problems with auction_request_failed diagnostics
* Retry once after parsing error

# Mon Nov  6 22:22:45 UTC 2017

* Revert "new" end screen & "new" dark end screen
* Fix major UI issues in iPhone X
* Add total background time into playable analytics events
* Fix integration tests

# Fri Nov  3 07:28:14 UTC 2017 (reverted)

* Switch to "new" end screen
* AB Test "new" dark end screen in groups 10 & 11
* Fix major UI issues in iPhone X
* Add total background time into playable analytics events

# Thu Nov  2 20:13:31 UTC 2017

* Refactor view event handlers
* Remove ab test to dismiss performance ad completely when video is skipped in group 5

# Wed Nov  1 20:09:28 UTC 2017

* Moat integration

# Tue Oct 31 10:55:28 UTC 2017

* Add versionCode (for Android SDK 2.1.1+) and simulator (iOS only) to ad request parameters
* Remove ab test for brand ad cta
* Adjust performance ad to dismiss completely when video is skipped in group 5
* Add parse duration to SdkStats
* Refactor ad plan refreshing triggers to CampaignRefreshManager

# Wed Oct 25 22:15:26 UTC 2017

* Check ad plan refreshing when any app activity resumes
* CTA styling A/B test on groups 10 and 11
* Refactor endscreen layout
* Add support for configUrl test metadata parameter
* Fix kafkaUrl test metadata parameter

# Mon Oct 23 21:35:15 UTC 2017

* Integrate SDKStats into Webview
* Send audio and headphone state with ad request

# Thu Oct 19 20:45:59 UTC 2017

* Trigger onStart when VPAIDAdUnit shows
* Removes VPAIDAdUnit debug diagnostics

# Wed Oct 18 21:19:54 UTC 2017

* Add diagnostics to all VPAID third party events, success and failed
* Stop quick retry test on parsing errors from group 5
* Fix handling for non-integer screen width and height values

# Mon Oct 16 20:19:29 UTC 2017

* Adds ad response to all diagnostic messages.

# Thu Oct 12 20:04:06 UTC 2017

* Fire VAST Impression on VPAID Ad Units
* Fixes click URL construction for Operative Events

# Wed Oct 11 01:48:02 UTC 2017

* Fix typo in VPAID content type
* Fix operative events with programmatic MRAID

# Tue Oct 10 17:15:40 UTC 2017

* Initial support for VPAID

# Tue Oct 10 09:11:38 UTC 2017

* Removed dark end screen A/B test (groups 8 & 9)
* Use event urls from comet response.

# Mon Oct  9 09:08:58 UTC 2017

* Sliding video player interface AB test (groups 10 & 11)
* Video end card click tracking event for VAST endscreen.
* Added static device info into kafka messages (Analytics)

# Thu Oct  5 13:30:35 UTC 2017

* Remove endscreen click ab-test
* Fix to reporting of duplicate mraid diagnostic events
* Faster retry logic after error (60-120s, was 1h)

# Mon Oct  2 11:43:28 UTC 2017

* Refactor SessionManager and EventManager
* Accept unsafe but legal URL characters in campaign assets

# Thu Sep 28 13:54:13 UTC 2017

* Enable creative testing without backend
* Fix retrying after campaign parsing or caching failure
* Remove parsed ad plan from diagnostics (ES indexing)

# Wed Sep 27 13:10:22 UTC 2017

* Dark end screen theme AB Test (groups 8 & 9)
* Remove additional click zones from end screen AB test (groups 10 & 11)
* Clean up parts of the campaign parsing refactoring

# Wed Sep 20 12:10:38 UTC 2017

* Initial display ads support
* Send analytics test data from gameIds 14850 and 14851
* Do not show 3rd party MRAIDs if no connectivity is available
* Include ad request response in plc_request_failed diagnostics
* Refactor campaign response parsers
* Make sure that string replacement patterns are not removed on string.replace operations
* Reject files larger than 20MB
* Call AdUnit.hide on display interstitial tests
* Browser build fixes

# Thu Sep 14 09:43:51 UTC 2017

* Refactored AuctionResponse to be a typed model.
* Added Chinese translations to the playable loading screen.
* 2.0.6+ fixed issue on iOS with opening in incorrect orientation.

# Tue Sep 12 08:50:43 UTC 2017

* Add auctionId to ad requests and all operative events, remove sessionId from operative events

# Mon Sep 11 12:02:52 UTC 2017

* Remove handle_campaign_failed diagnostic message
* Always send cached parameter in operative events
* Send timestamp for all diagnostic events
* Increase minimum config.json check delay from 15 minutes to 60 minutes for all versions 2.1.0 and earlier to reduce reinit crashes

# Thu Sep  7 13:35:33 UTC 2017

* Add handle_campaign_failed diagnostic message

# Thu Sep  7 10:05:12 UTC 2017

* Store gamerId and send stored gamerId only for iOS devices with limit ad tracking

# Wed Sep  6 08:32:29 UTC 2017

* Update to TypeScript 2.5 and update other dependencies
* Update rollup config for changed parameters
* Fix ClientInfo settings in browser build
* Improve playable analytics
* Fix edge cases with programmatic MRAID expiration
* Remove test.auctionUrl test setting
* Refactor code so that unit tests will not have pending timers

# Mon Sep  4 12:30:36 UTC 2017

* Refactor campaign handling code to drop support for yield and use auction unconditionally
* Campaign expiration now consistently uses willExpireAt instead of timeout
* Fix VAST links to properly follow redirections
* Set fixed position for info popup
* Show playable loading screen on all groups

# Thu Aug 31 11:56:13 UTC 2017

* Refactoring focus related handling to FocusManager
* Fix some test mode edge cases with auction
* Stop disabling portrait videos on groups 6 and 7

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
* Add screenSize and screenDensity for operative events

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

