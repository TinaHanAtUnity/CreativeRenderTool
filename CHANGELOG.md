# Thu May  3 20:22:59 UTC 2018

* Fix for CSS image URL corner case issue
* Fix getNetworkMetered API and DeviceInfo model

# Wed May  2 20:31:05 UTC 2018

* Square image abtest
* GDPR v2 pop up on group 18 and 19
* Send opt-out event on end screen hide
* Add optional signals to auction request body

# Thu Apr 26 20:23:59 UTC 2018

* Initial support for Jaeger tracing service
* Fix cache bookkeeping cleaning problems
* Send game session start, view and ad request counters

# Thu Apr 26 11:21:20 UTC 2018

* Remove backup campaign test from groups 7 and 8
* Remove Android batching test from groups 9 and 10

# Wed Apr 25 20:47:11 UTC 2018

* Refactor video event handlers
* Update dependencies

# Tue Apr 24 15:26:28 UTC 2018

* Revert NewRefreshManager and use only OldCampaignRefreshManager

# Tue Apr 24 07:09:48 UTC 2018

* Use NewRefreshManager as default.
* Additional logging for request to ready time and IFrame loading time.
* Additional realtime request diagnostics.
* Modify value passed to Purchasing as a combination of game id and token.

# Thu Apr 19 10:15:46 UTC 2018

* Add more realtime diagnostic information for kibana
* Fetch and add sid when sending xpromo events (redeem callback fix for xpromo)

# Tue Apr 17 10:14:11 UTC 2018

* GDPR pop-up A/B test in groups 16 & 17

# Mon Apr 16 20:50:03 UTC 2018

* Android batching A/B test in groups 9 & 10
* Use cached campaign when intializing SDK (A/B test in groups 7 & 8)
* Remove refresh manager A/B test from groups 9 & 10
* Add support for last three admob optional signals
* Remove session_start_failed -diagnostics fro now

# Wed Apr 11 22:16:33 UTC 2018

* Honor using WebView UA for tracking for MRAID click attribution
* Enable the App Sheet on iOS 11.3
* Add androidId to operative event data if platform is android

# Tue Apr 10 20:41:22 UTC 2018

* Optional Admob Signals
* Unit tests for Campaign Parsers
* Assume native calls from previous auction request for realtime speedup

# Mon Apr 9 20:36:04 UTC 2018

* Removed special case for roll-the-ball playable
* Revised iPhone X layout (AB groups 18 & 19)
* Cache utility cleanup
* Split auction request failed diagnostics
* Remove dependency of main video asset existing to be able to return streaming asset
* Add host and proto to third_party_event_failed analytic (also remove duplicate diagnostic)
* Fixes Listener start event not being sent in AdMob ads for versions <2.2.0
* Fixes quartile name in AdMob ads for versions <2.2.0

# Thu Apr 5 20:28:31 UTC 2018

* Fixed a bug where streaming video was cached and shown by default
* Rename ForceOrientation to Orientation

# Wed Apr 4 20:10:07 UTC 2018 

* Start new refresh manager A/B test in groups 9 & 10
* Stop refresh manager A/B test in groups 9 & 11
* Add proper handling of no fill retrying to NewRefreshManager
* Micro-optimization for ordering native invocations during ad unit opening
* Remove easter theme.
* Temporarily enable sending diagnostic for third party tracker errors
* Cleanup Assetmanagers getOrientedVideo to use CampaignAssetInfo methods

# Mon Apr 2 22:38:47 UTC 2018

* Realtime latency optimization and tracking.
* Reduce duration of closeable state for display interstitial.
* Issue logging for IAP.
* Remove AdMob diagnostic messages.

# Fri Mar 30 05:33:42 UTC 2018

* Change AdMob video asset to be optional for streaming fallback.
* Disable precaching on AdMob for iOS completely.

# Wed Mar 28 20:07:19 UTC 2018

* Another attempt at fixing race condition in new refresh manager

# Wed Mar 28 07:54:36 UTC 2018

* AdMob caching changes

# Tue Mar 27 18:28:05 UTC 2018

* Easter theme to all groups except 5
* Fix IAP promo Android back button handling
* Fix race condition in new refresh manager

# Mon Mar 26 10:16:09 UTC 2018

* Test new ad request refresh logic and reinit logic in groups 9 and 11

# Thu Mar 22 20:52:53 UTC 2018

* Remove ramdom CTA button colour test from groups 8 & 10
* Display Centering
* ForceSessionId parameter for APIN

# Wed Mar 21 22:18:31 UTC 2018

* Asset Caching Refactor

# Wed Mar 21 11:34:25 UTC 2018

* Adds MissingImpressionOrdinal support for SDK < 2.1.2
* Refactor CampaignParser creation to CampaignParserFactory

# Tue Mar 20 21:51:37 UTC 2018

* Initial support for realtime auction
* Fix AdMob accelerometer fraud signals

# Tue Mar 20 06:58:53 UTC 2018

* Easter theme A/B test in groups 16 & 17
* Remove overlay A/B test from groups 16 & 17

# Mon Mar 19 07:48:44 UTC 2018

* Support for new A/B testing framework
* Add sessionDepth parameter to ad requests

# Fri Mar 16 07:04:01 UTC 2018

* iOS screen size fix for analytics
* Split operative event manager into multiple operative event managers
* XPromo: parse meta field
* Use almost white background color in end screen

# Thu Mar 15 09:31:49 UTC 2018

* Disable DeviceInfo.getApkDigest to fix Android 2.2.0 issues
* Encode UTF-8 characters in asset URLs before giving them to native SDK
* Display ads: Open links in new browser for iOS also
* Disable failing cache tests

# Wed Mar 14 09:55:49 UTC 2018

* Progress bar video overlay A/B test in groups 16 & 17
* Send targetGameId as a string value in xpromo events
* Remove IAP transaction metadata support

# Tue Mar 13 08:20:24 UTC 2018

* Enable Android native bridge 1ms autobatching on all groups
* Rename InterstitialOverlay to ClosableVideoOverlay
* Fix tslint configuration and fix linter errors

# Mon Mar 12 10:13:52 UTC 2018

* Add target game ID to xpromo events
* Remove hard-coded game IDs which were used to enable overlay features

# Fri Mar  9 09:37:38 UTC 2018

* Remove progress bar from groups 16 and 17
* Revert "Show time to close / skip for mraid overlays" from groups 18 and 19
* Add URL whitelist check for Android display interstitial ad unit
* Add missing_default_placement diagnostic event

# Thu Mar  8 09:59:59 UTC 2018

* Playable configuration file support
* Refactor campaign refresh manager - part one
* Improve test stability

# Wed Mar  7 06:32:14 UTC 2018

* Reduce info level logging
* Moved hard-coded game IDs to CustomFeatures
* Improved error message for invalid game ID

# Tue Mar  6 11:43:29 UTC 2018

* Add source game id to xpromo events
* Allow certain range unicode characters in urls
* Obfuscate spam idenfiers in AFMA container
* AFMA: fix click signals

# Tue Mar  6 06:29:39 UTC 2018

* Test Android native bridge with 1ms autobatching on groups 12 and 13
* Fix Android problem with close button, landscape orientation and scaled fonts

# Fri Mar  2 09:31:54 UTC 2018

* Refactor some programmatic properties away from base campaign model
* Update dependencies

# Thu Mar  1 10:39:02 UTC 2018

* Validate and encode all incoming asset URLs
* Fix cache redirections on 2.2.0
* Show time to close / skip for MRAID overlays on group 18 and 19
* Fix creative slot colliding with video slot for VPAID
* Fixed issue with how setViewFrame was being used

# Wed Feb 28 13:55:33 UTC 2018

* Fixes for openUrl and sendEvent for VPAID
* New AdMob spam signals for SDK 2.2.0
* Refactor and add missing device infos
* Overlay progress bar AB test for groups 16 & 17
* Remove lunar theme AB test

# Fri Feb 23 15:10:28 UTC 2018

* Fix MOAT init & closing due to bad merge

# Fri Feb 23 10:27:13 UTC 2018

* Purchasing utilities cleanup
* Disable app sheet on iPhone iOS 11
* Fix orientation issues for Promo Android
* Display ads: fixed ABT-373 and ABT-374 Cleanups, simplification of adunit.
* Fix the view rendering and add system interrupt observer for iOS foreground and background events to VPAIDAdUnit
* VPAID container fixes
* Fix hybrid tests & disable 2 broken PurchasingUtilities tests
* Add iOS screenScale to ad request query parameters
* Fix missing MOAT stylesheet 

# Thu Feb 22 08:57:26 UTC 2018

* Preparations for new double webview APIs in 2.2.0 release
* Preparations for new IAP promo APIs in 2.2.0 release
* Removal of VPAID and display ad support from all pre-2.2.0 releases
* Remove video overlay test from groups 8 and 10
* Start random download button color test on groups 8 and 10

# Fri Feb 16 10:18:25 UTC 2018

* Add ad unit style object to operative events
* Modify analytics event formats to better match Unity Analytics event formats

# Thu Feb 15 09:07:01 UTC 2018

* Preparations for new cache APIs in 2.2.0 release

# Wed Feb 14 14:59:14 UTC 2018

* Enable lunar theme on all groups except 5
* Miscellaneous AdMob fixes

# Wed Feb 14 10:24:20 UTC 2018

* Revert previous deployment

# Wed Feb 14 10:24:20 UTC 2018

* Validate and encode all incoming URLs to handle unsafe characters
* Enable lunar theme on all groups except 5

# Tue Feb 13 09:49:36 UTC 2018

* Remove the hidden margin from the admob iframe
* Enable MOAT on all SDK 2 versions without volume change listeners
* New overlay AB test on groups 8 & 10
* Send diagnostics if callback cannot be found when onDownloadStart event is received
* Cleanup protobuf build & use minified release

# Fri Feb  9 11:00:06 UTC 2018

* Add config_parsing_failed diagnostic event

# Thu Feb  8 12:36:42 UTC 2018

* Lunar new year theme (groups  5 & 6)
* Fade animation can be disabled on rewarded placements
* Change config request base url for new config service

# Wed Feb  7 11:08:36 UTC 2018

* Disable cache cleaning on all iOS SDK 2.0.x versions to revert accidental problem caused by deployment on Tue Feb 6 08:17 UTC

# Wed Feb  7 10:16:29 UTC 2018

* Start test with new video overlay on groups 8 and 10
* Add call to VAST impression tracking event

# Tue Feb  6 08:17:32 UTC 2018

* Enable custom MRAID fast forward feature for all the playables
* Refactor cache bookkeeping
* Fix metadata caching

# Thu Feb  1 12:47:26 UTC 2018

* Add support for upcoming overlay placement parameters
* Merge 2.2.0 APIs

# Wed Jan 31 10:34:49 UTC 2018

* Add xpromo event type to Kafka info json

# Tue Jan 30 12:20:25 UTC 2018

* Fix video caching on XPromos

# Mon Jan 29 10:22:43 UTC 2018

* Combined endscreen with store buttons AB test (groups 8 & 9)
* Initial XPromo support

# Thu Jan 25 11:38:27 UTC 2018

* Fix RVDT typo
* Fix persistent gamer SID

# Tue Jan 23 12:08:45 UTC 2018

* Fix AdMob time on screen click signal

# Tue Jan 23 09:19:04 UTC 2018

* Refactor campaign model constructors
* Reject and never show videos longer than 40 seconds
* Combined end screen with golden stars and platform specific download button on groups 10 and 11

# Thu Jan 18 08:36:17 UTC 2018

* Initial support for AdMob click signals
* Send analytics events to CDP production endpoint

# Wed Jan 17 23:33:54 UTC 2018

* `admob_ad_impression` diagnostic added.

# Wed Jan 17 12:26:52 UTC 2018

* Use streaming fallback if comet video size and cached video size are different

# Tue Jan 16 10:23:28 UTC 2018

* Test combined endscreen on A/B groups 8 and 9
* Remove Roll the Ball endscreen A/B test
* Remove random number generator test
* Send video_size_mismatch diagnostic if comet video size and cached video size are different

# Thu Jan 11 17:49:27 UTC 2018

* Send auction_invalid_json diagnostic message when auction response JSON parsing fails
* Handle Cache.getFilePath FILE_NOT_FOUND error in auction_request_failed diagnostic message
* Fix creative test app to work with latest auction ID changes

# Wed Jan 10 18:52:53 UTC 2018

* Recreate ad request parameters when retrying with connectivity events
* Fixes for AdMob spam signals for screen width, screen height and app installer

# Tue Jan  9 12:32:29 UTC 2018

* Switch to server-side auction ID
* Stop refreshing ads when Unity ad unit activity resumes
* Fix overlay width and height on iPhone X
* Use env() css function for layout safety margins in iOS 11.2

# Mon Jan  8 08:56:05 UTC 2018

* Remove xmas theme
* Follow all 3xx redirect HTTP status codes and set max limit of redirections to 10
* Remove game ID from endscreen privacy popup
* Pass raw free cache space value from native SDK in caching_disabled diagnostic message

# Thu Jan  4 10:59:50 UTC 2018

* MRAID fixes for iOS XInstall blackscreen issue
* MRAID fixes for Beeswax event listening problems

# Wed Jan  3 13:18:38 UTC 2018

* Disable caching if there is less than 20 megabytes of free space on device
* Add debugging diagnostics for native random UUID generator

# Wed Dec 20 20:51:09 UTC 2017

* Changed xmas theme to prevent overlaying game icon

# Wed Dec 20 00:04:26 UTC 2017

* Add PTS click tracking for VAST
* Change AdMob start diagnostic firing to reflect TPS.

# Mon Dec 18 21:47:30 UTC 2017

* Fix failing hybrid test
* Remove ComScore AB groups, enable on whole network
* Fix display unit tests
* Set xmas end screen by default except groups 10 & 11 
* Remove dark end screen

# Fri Dec 15 11:12:36 UTC 2017

* Fix for iOS AdMob spam signals

# Fri Dec 15 05:53:39 UTC 2017

* Fixes various issues reported by AdMob

# Thu Dec 14 20:09:09 UTC 2017

* Redeployment of previous deployment with fixed Video model handling for portrait videos

# Thu Dec 14 19:04:21 UTC 2017

* Fix VAST end screen layout
* Xmas endscreen theme on groups 18 and 19
* Rearrange MOAT parameters
* Add session to every asset for better diagnostics
* Send webview user agent for tracking events based on auction response
* Clickthrough parse on Display Interstitial Campaign and Display Interstitial Url Campaign

# Thu Dec 14 12:03:50 UTC 2017

* Redeployment of previous deployment with fixed placement ID handling

# Wed Dec 13 21:24:50 UTC 2017

* Refactor/cleanup ad unit model abuse
* No fill retrying for production
* Show build info in privacy pop up on end screen
* Show playable end screen on Roll the Ball campaign
* Add URL parser & parse APK redirect location correctly
* Adjust video overlay safety margins in landscape mode
* Sample SdkStats with game session ID

# Tue Dec 12 19:04:39 UTC 2017

* Initial support for AdMob ad units

# Tue Dec 12 11:07:50 UTC 2017

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

