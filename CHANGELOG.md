# Staged

* Make the RedesignedEndScreenDesignTest ZyngaFilteredABTest instead of a normal one [#10401](https://github.com/Applifier/unity-ads-webview/pull/10401)
* AB test: Replace 'Agree to all' with 'Accept all' in English versions [#10400](https://github.com/Applifier/unity-ads-webview/pull/10400)
* Change Stackdriver Trace endpoint to new trace endpoint [#10183](https://github.com/Applifier/unity-ads-webview/pull/10183)


# Wed Jun 26 22:46:04 UTC 2019

* Move osVersion from PerformanceAdUnitParametersFactory to AbstractAdUnitParametersFactory to make creation of staging branches more easy [#10399](https://github.com/Applifier/unity-ads-webview/pull/10399)
* New End Card UI with "pop" out element experiment [#10163](https://github.com/Applifier/unity-ads-webview/pull/10163)
* Remove animated endcard test [#10372](https://github.com/Applifier/unity-ads-webview/pull/10372)
* Add iphone x styles and china watermark for xpromo [#10371](https://github.com/Applifier/unity-ads-webview/pull/10371)
* Move Analytics to Ads [#10319](https://github.com/Applifier/unity-ads-webview/pull/10319)
* Promo TLO impressionDate should send number to sdks [#9988](https://github.com/Applifier/unity-ads-webview/pull/9988)

# Tue Jun 25 17:14:41 UTC 2019

* Added handling of 'all: true' to incident fix [#10316](https://github.com/Applifier/unity-ads-webview/pull/10316)
* Remove incorrect 'ad_did_showad_background' kibana log [#10369](https://github.com/Applifier/unity-ads-webview/pull/10369)
* Allowing vast end card size minimum to 200 x 200 from 320 x 480 [#10321](https://github.com/Applifier/unity-ads-webview/pull/10321)
* Block Unnecessary Load Calls to Auction [#10320](https://github.com/Applifier/unity-ads-webview/pull/10320)
* Move AuctionRequest from Banners/Utilities => Ads/Networking [#10323](https://github.com/Applifier/unity-ads-webview/pull/10323)
* Remove all backup campaign code [#10317](https://github.com/Applifier/unity-ads-webview/pull/10317)
* Remove consent ab test [#10370](https://github.com/Applifier/unity-ads-webview/pull/10370)

# Fri Jun 21 22:57:46 UTC 2019

* Adding more logs for #incident-20190605-1 [#10322](https://github.com/Applifier/unity-ads-webview/pull/10322)

# Thu Jun 20 09:19:11 UTC 2019

* Add diagnostics for privacy sanitization [#10293](https://github.com/Applifier/unity-ads-webview/pull/10293)

# Wed Jun 19 22:07:53 UTC 2019

* Setup model for HTML and IFrame companion ad for VAST - part 1 [#10159](https://github.com/Applifier/unity-ads-webview/pull/10159)
* Add Diagnostics to track #incident-20190605-1 [#10289](https://github.com/Applifier/unity-ads-webview/pull/10289)
* Reverse the Load AB Test to 90% of Select Game Traffic [#10237](https://github.com/Applifier/unity-ads-webview/pull/10237)
* Send Store Transaction Data Correctly [#10290](https://github.com/Applifier/unity-ads-webview/pull/10290)

# Wed Jun 19 12:27:27 UTC 2019

* There was a bug in the sanitizer, fixed and added tests [#10209](https://github.com/Applifier/unity-ads-webview/pull/10209)

# Tue Jun 18 23:50:11 UTC 2019

* Fix AdmobAdUnitTest failures in Hybrid Tests [#10212](https://github.com/Applifier/unity-ads-webview/pull/10212)
* Add fields 'targetGameId' and 'campaignId' to Playable Ad Events [#8523](https://github.com/Applifier/unity-ads-webview/pull/8523)
* UADSSDK-82 : Api's crashing iOS apps [#10157](https://github.com/Applifier/unity-ads-webview/pull/10157)
* Fix Endcard Animation [#10155](https://github.com/Applifier/unity-ads-webview/pull/10155)
* Introduce Consent AB Test Removing the Unity Logo [#10185](https://github.com/Applifier/unity-ads-webview/pull/10185)
* Turn on Store API [#10156](https://github.com/Applifier/unity-ads-webview/pull/10156)
* Improved Unit Tests for MOAT View [#10105](https://github.com/Applifier/unity-ads-webview/pull/10105)
* Improve Makefile (part of integration test update) [#10210](https://github.com/Applifier/unity-ads-webview/pull/10210)
* Update Test Job URLs in README [#10131](https://github.com/Applifier/unity-ads-webview/pull/10131)

# Tue Jun 18 10:39:27 UTC 2019

* Stop sending sanitization events [#10186](https://github.com/Applifier/unity-ads-webview/pull/10186)

# Tue Jun 18 08:57:29 UTC 2019

* Fix for #incident-20190516-2 [#9987](https://github.com/Applifier/unity-ads-webview/pull/9987)

# Fri Jun 14 20:44:10 UTC 2019

* \[ABT-854\] Track Admob Rewarded Video Metrics [#10129](https://github.com/Applifier/unity-ads-webview/pull/10129)
* Fix Incorrect Ad Player Volume - MOAT [#9954](https://github.com/Applifier/unity-ads-webview/pull/9954)
* Temporarily Whitelist in GameID 3016669 to not Block Ads in Background [#10130](https://github.com/Applifier/unity-ads-webview/pull/10130)

# Thu Jun 13 15:14:38 UTC 2019

* Remove Realtime feature - CampaignManager refactor part 1 [#10014](https://github.com/Applifier/unity-ads-webview/pull/10014)
* Block Ads Shown while Application is Backgrounded [#10104](https://github.com/Applifier/unity-ads-webview/pull/10104)
* Add isLoadEnabled to Operative Events [#10106](https://github.com/Applifier/unity-ads-webview/pull/10106)

# Tue Jun 11 22:58:07 UTC 2019

* Add Metric to Track when Tracking URLs are not set on Show [#10102](https://github.com/Applifier/unity-ads-webview/pull/10102)
* Minor Fixes for Load API [#10100](https://github.com/Applifier/unity-ads-webview/pull/10100)
* Remove/Reduce severity of IAP logs from Ads Initialization [#10022](https://github.com/Applifier/unity-ads-webview/pull/10022)
* Use tslint through typescript-eslint [#9989](https://github.com/Applifier/unity-ads-webview/pull/9989)
* ESLint : no-tabs rule enabled [#10017](https://github.com/Applifier/unity-ads-webview/pull/10017)
* ESLint : no-trailing-spaces rule enabled [#10018](https://github.com/Applifier/unity-ads-webview/pull/10018)
* ESLint : enable no-irregular-whitespace [#10016](https://github.com/Applifier/unity-ads-webview/pull/10016)
* ESLint : Enable `ban-types` rule [#10015](https://github.com/Applifier/unity-ads-webview/pull/10015)

# Tue Jun 11 02:36:41 UTC 2019

* Fix Load Metrics [#10075](https://github.com/Applifier/unity-ads-webview/pull/10075)

# Mon Jun 10 23:42:26 UTC 2019

* Metadata Enabled Per Placement Load Functionality Test [#9685](https://github.com/Applifier/unity-ads-webview/pull/9685)

# Fri Jun  7 19:56:54 UTC 2019

* Consent CTA ab test (bolder fonts) [#10049](https://github.com/Applifier/unity-ads-webview/pull/10049)
* Move ProgrammaticTrackingService to Core module [#10023](https://github.com/Applifier/unity-ads-webview/pull/10023)
* Making Core Module available to CampaignManager [#10048](https://github.com/Applifier/unity-ads-webview/pull/10048)
* Don't show ad when app is in background #incident-20190605-1 [#10024](https://github.com/Applifier/unity-ads-webview/pull/10024)
* IMEI collection logic update for China traffic [#10021](https://github.com/Applifier/unity-ads-webview/pull/10021)

# Wed Jun  5 21:58:38 UTC 2019

* ESLint : No multiple blank lines and end of file must have newline [#9952](https://github.com/Applifier/unity-ads-webview/pull/9952)
* ESLint : semi rule enabled [#9949](https://github.com/Applifier/unity-ads-webview/pull/9949)
* Log update for ad_ready/received and adding china imei log [#9990](https://github.com/Applifier/unity-ads-webview/pull/9990)
* Add back ad_shown_in_background diagnostic [#10013](https://github.com/Applifier/unity-ads-webview/pull/10013)
 
# Tue Jun  4 16:35:13 UTC 2019

* End card transition experiment [#9715](https://github.com/Applifier/unity-ads-webview/pull/9715)
* Consent CTA ab test [#9984](https://github.com/Applifier/unity-ads-webview/pull/9984)
* Change SDK Bot Webhook Endpoint [#9961](https://github.com/Applifier/unity-ads-webview/pull/9961)
* ESLint : no-use-before-define [#9894](https://github.com/Applifier/unity-ads-webview/pull/9894)
* Disable Banner Refresh for GameID 2962474 [#9953](https://github.com/Applifier/unity-ads-webview/pull/9953)

# Mon Jun  3 21:23:43 UTC 2019

* Remove Combine skip under timer and progress bar experiment [#9958](https://github.com/Applifier/unity-ads-webview/pull/9958)
* Remove Early CTA V2 experiment [#9925](https://github.com/Applifier/unity-ads-webview/pull/9925)
* ESLint prefer-interface [#9896](https://github.com/Applifier/unity-ads-webview/pull/9896)
* ESLint interface-name-prefix [#9898](https://github.com/Applifier/unity-ads-webview/pull/9898)
* ESLint type-annotation-spacing [#9895](https://github.com/Applifier/unity-ads-webview/pull/9895)
* Fix game ids to be Android version for MRAIDWebPlayerTest [#9956](https://github.com/Applifier/unity-ads-webview/pull/9956)
* Use Correct ConnectionNeeded Metric [#9959](https://github.com/Applifier/unity-ads-webview/pull/9956)

# Fri May 31 16:55:24 UTC 2019

* Disable Consent A/B test [#9926](https://github.com/Applifier/unity-ads-webview/pull/9926)
* Make OM adSessionId unique for each ad playback [#9888](https://github.com/Applifier/unity-ads-webview/pull/9888)
* Separate VideoPlayerVolume from DeviceVolume Open Measurement [#9764](https://github.com/Applifier/unity-ads-webview/pull/9764)
* Add XInstall test creativeids and gameids for testing MRAID Webplayer [#9922](https://github.com/Applifier/unity-ads-webview/pull/9922)
* Remove Banner Placement WAITING State [#9924](https://github.com/Applifier/unity-ads-webview/pull/9924)
* Remove Unnecessary Banner Method [#9923](https://github.com/Applifier/unity-ads-webview/pull/9923)
* Add Metrics for Failure Cases Before Ad Playback [#9893](https://github.com/Applifier/unity-ads-webview/pull/9893)

# Wed May 29 20:29:52 UTC 2019

* Combined skip and progress bar experiment [#9815](https://github.com/Applifier/unity-ads-webview/pull/9815)
* ESLint Investigation [#9610](https://github.com/Applifier/unity-ads-webview/pull/9610)
* Remove unnecessary china tracking id kibana logs [#9814](https://github.com/Applifier/unity-ads-webview/pull/9814)
* Enable IMEI collection for SDK 3.1.0+ [#9788](https://github.com/Applifier/unity-ads-webview/pull/9788)
* Move Creation of VastParserStricts to Constructors [#9812](https://github.com/Applifier/unity-ads-webview/pull/9812)
* Disable Vast Endcards Lacking Impressions Part 2 [#9813](https://github.com/Applifier/unity-ads-webview/pull/9813)

# Tue May 28 15:00:00 UTC 2019

* Revert "Merge pull request #9765 from Applifier/add/all-content-types (incident-20190528)

# Mon May 27 10:00:42 UTC 2019

* Add temporary custom Kafka event to performance video overlay download [#9841](https://github.com/Applifier/unity-ads-webview/pull/9841)
* Consent AB test: Decrease font sizes to see the effect of the smaller font size [#9818](https://github.com/Applifier/unity-ads-webview/pull/9818)

# Thu May 23 22:27:28 UTC 2019

* VAST Error Tracking - part 3: alerting DSP more errors [#9714](https://github.com/Applifier/unity-ads-webview/pull/9714)
* Revert "Add more LoopMe seatId" [#9737](https://github.com/Applifier/unity-ads-webview/pull/9737)
* Revert "Add hulu ads to allow doubleverify viewability tracker" [#9740](https://github.com/Applifier/unity-ads-webview/pull/9740)
* Move All ContentTypes and CampaignParseErrors to Enums [#9765](https://github.com/Applifier/unity-ads-webview/pull/9765)

# Wed May 22 17:00:16 UTC 2019

* Early CTA v2 experiment [#9683](https://github.com/Applifier/unity-ads-webview/pull/9683)
* 3.1.0 Merge changes to master [#9712](https://github.com/Applifier/unity-ads-webview/pull/9712)

# Tue May 21 17:16:32 UTC 2019

* Add NativeInfo to Open Measurement SessionStart context [#9738](https://github.com/Applifier/unity-ads-webview/pull/9738)
* China ifa logging [#9763](https://github.com/Applifier/unity-ads-webview/pull/9763)

# Mon May 20 15:48:35 UTC 2019

* Consent A/B test: design update [#9684](https://github.com/Applifier/unity-ads-webview/pull/9684)
* Add bundleId to optout messages [#9661](https://github.com/Applifier/unity-ads-webview/pull/9661)

# Fri May 17 22:55:29 UTC 2019

* VAST Error Tracking - part 2: campaign error level [#9660](https://github.com/Applifier/unity-ads-webview/pull/9660)
* Fall back to non-transparent activity if opening transparent activity fails [#9687](https://github.com/Applifier/unity-ads-webview/pull/9687)
* Add LoopMe SeatIDs to whitelist [#9688](https://github.com/Applifier/unity-ads-webview/pull/9688)

# Thu May 16 16:26:48 UTC 2019

* IMEI support for main SDK [#9199](https://github.com/Applifier/unity-ads-webview/pull/9199)

# Wed May 15 18:04:53 UTC 2019

* Fix open measurement timestamp and device volume [#9634](https://github.com/Applifier/unity-ads-webview/pull/9634)
* Disable Vast Endscreens Lacking Impressions [#9609](https://github.com/Applifier/unity-ads-webview/pull/9609)
* Introduce isBannerPlacement to SDK Versions <3.0 and Remove Banner Placements from being Requested (Manual Patch)
* Add hulu ads to allow doubleverify viewability tracker [#9659](https://github.com/Applifier/unity-ads-webview/pull/9659)
* Set timeout to remove OM from view after Verification Script requests made [#9637](https://github.com/Applifier/unity-ads-webview/pull/9637)

# Tue May 14 16:48:35 UTC 2019

* Add missing deployment files in China bucket [#9636](https://github.com/Applifier/unity-ads-webview/pull/9636)
* Remove slider endcard experiment [#9635](https://github.com/Applifier/unity-ads-webview/pull/9635)
* Remove unused code related to the old consent design [#9533](https://github.com/Applifier/unity-ads-webview/pull/9533)
* Fix OM Javadoc Comments and Add TODOs [#9608](https://github.com/Applifier/unity-ads-webview/pull/9608)
* Move PTS Metrics to Separate Enums [#9611](https://github.com/Applifier/unity-ads-webview/pull/9611)
* Investigate Magnitude of VAST Videos which Fail to Send Impressions [#9612](https://github.com/Applifier/unity-ads-webview/pull/9612)

# Mon May 13 21:50:59 UTC 2019

* Fix Banner not ready after first banner is shown [#9561](https://github.com/Applifier/unity-ads-webview/pull/9561)
* Fix Banners not trying to get fill after no fill [#9560](https://github.com/Applifier/unity-ads-webview/pull/9560)
* VAST Error Tracking - part 1 [#9562](https://github.com/Applifier/unity-ads-webview/pull/9562)
* GCP: use unity-ads-sdk-prd bucket [#9607](https://github.com/Applifier/unity-ads-webview/pull/9607)

# Fri May 10 16:38:03 UTC 2019

* Fix MRAID Webplayer AB group [#9559](https://github.com/Applifier/unity-ads-webview/pull/9559)

# Thu May  9 16:48:28 UTC 2019

* Slideshow endcard experiment [#8858](https://github.com/Applifier/unity-ads-webview/pull/8858)
* Add `ads.` prefix to Ads SDK analytics topics [#9487](https://github.com/Applifier/unity-ads-webview/pull/9487)
* VastCompanionAdStaticResource validator update [#9532](https://github.com/Applifier/unity-ads-webview/pull/9532)
* Update user summary privacy endpoint [#9509](https://github.com/Applifier/unity-ads-webview/pull/9509)
* Reduce to one abgroup for MRAID WebPlayer test [#9556](https://github.com/Applifier/unity-ads-webview/pull/9556)

# Wed May  8 17:45:57 UTC 2019

* Calculate additional Open Measurement Obstructions [#9223](https://github.com/Applifier/unity-ads-webview/pull/9223)
* Add Lion Studios games to fire ad dismiss delegate callback after animation is finished [#9510](https://github.com/Applifier/unity-ads-webview/pull/9510)

# Tue May  7 18:10:12 UTC 2019

* China config json deploy [#9272](https://github.com/Applifier/unity-ads-webview/pull/9272)

# Mon May  6 22:35:49 UTC 2019 

* Remove top overlay progress bar experiment [#9393](https://github.com/Applifier/unity-ads-webview/pull/9393)
* ABTest round 2 for MRAID webplayer [#9486](https://github.com/Applifier/unity-ads-webview/pull/9486)

# Mon May  6 11:54:47 UTC 2019

* Italian and Portuguese localization for consent views [#9443](https://github.com/Applifier/unity-ads-webview/pull/9443) 

# Fri May  3 19:52:17 UTC 2019 

* Russian localization for consent views [#9419](https://github.com/Applifier/unity-ads-webview/pull/9419)
* Temporarily disable video_size_mismatch for VAST Videos [#9394](https://github.com/Applifier/unity-ads-webview/pull/9394)
* Send Finish event after Ad Unit container destroy [#9396](https://github.com/Applifier/unity-ads-webview/pull/9396)

# Fri May  3 12:04:59 UTC 2019

* Consent localization for Spanish [#9397](https://github.com/Applifier/unity-ads-webview/pull/9397)

# Thu May  2 18:00:07 UTC 2019

* Consent localization for German [#9392](https://github.com/Applifier/unity-ads-webview/pull/9392)
* Remove china permission diagnostics [#9367](https://github.com/Applifier/unity-ads-webview/pull/9367)
* Add width and height properties into Video object for OM [#9369](https://github.com/Applifier/unity-ads-webview/pull/9369)
* Allow analytics events for Programmatic MRAID [#9368](https://github.com/Applifier/unity-ads-webview/pull/9368)
* Edit China Metrics to Collect More Relevant Information [#9391](https://github.com/Applifier/unity-ads-webview/pull/9391)

# Wed May  1 16:06:14 UTC 2019

* Add Metrics to Track User Behavior in China [#9345](https://github.com/Applifier/unity-ads-webview/pull/9345)

# Tue Apr 30 10:27:46 UTC 2019

* Consent A/B test: add a new consent CTA test and remove the old one [#9271](https://github.com/Applifier/unity-ads-webview/pull/9271)
* Deprecate ProgrammaticVastParserStrict in favor of ProgrammaticVastParser [#9298](https://github.com/Applifier/unity-ads-webview/pull/9298)
* Fix back button exit for rewarded promo [#9321](https://github.com/Applifier/unity-ads-webview/pull/9321)
* Remove Banner Limited Ad Tracking Diagnostic [#9299](https://github.com/Applifier/unity-ads-webview/pull/9299)

# Fri Apr 26 16:24:40 UTC 2019

* Fix Banner Limited Ad Tracking Metric [#9274](https://github.com/Applifier/unity-ads-webview/pull/9274)
* Remove Auction V4 Whitelist and iOS Crash Test [#9249](https://github.com/Applifier/unity-ads-webview/pull/9249)
* Revert "Add stages for tests and deployment" [#9248](https://github.com/Applifier/unity-ads-webview/pull/9248)

# Thu Apr 25 18:10:10 UTC 2019

* Hotfix for Consent Permissions [#9273](https://github.com/Applifier/unity-ads-webview/pull/9273)

# Thu Apr 25 12:13:52 UTC 2019

* Consent localization for France [#9247](https://github.com/Applifier/unity-ads-webview/pull/9247)

# Wed Apr 24 18:52:48 UTC 2019

* Fix AR Delayed Camer Consent Layout [#9133](https://github.com/Applifier/unity-ads-webview/pull/9133)
* Remove iterating through all values from AFMA Tracking Events [#9224](https://github.com/Applifier/unity-ads-webview/pull/9224)
* Reintroduce Minor Tracking Refactor with Admob Fixes [#9200](https://github.com/Applifier/unity-ads-webview/pull/9200)
* Add PTS and Kibana Metrics to Track Banner Requests with Limited Ad Tracking Enabled [#9154](https://github.com/Applifier/unity-ads-webview/pull/9154)
* Add PTS Error Event when Vast Endscreen Click is fired without an Impression [#9153](https://github.com/Applifier/unity-ads-webview/pull/9153)

# Fri Apr 19 21:06:10 UTC 2019

* Disabled ABTest Third Party Open Measurement implementation for VAST [#9026](https://github.com/Applifier/unity-ads-webview/pull/9026)

# Thu Apr 18 23:43:35 UTC 2019

* A/B test: Change order of the cta buttons on my choices page [#9101](https://github.com/Applifier/unity-ads-webview/pull/9101)
* Track Homescreen Consent Link Clicks with PTS [#9102](https://github.com/Applifier/unity-ads-webview/pull/9102)
* Add MetaJoy's Android GameIds to V4 list [#9151](https://github.com/Applifier/unity-ads-webview/pull/9151)
* MRAID close button styles fix [#9150](https://github.com/Applifier/unity-ads-webview/pull/9150)
* Add CampaignId to CreativeBlocking Payload [#9152](https://github.com/Applifier/unity-ads-webview/pull/9152)

# Reverted to LKGs (Wed Apr 17 13:05:52 UTC 2019) - Thu Apr 18 19:21:48 UTC 2019
* Revert A/B test: Change order of the cta buttons on my choices page [#9101](https://github.com/Applifier/unity-ads-webview/pull/9101)
* Revert Track Homescreen Consent Link Clicks with PTS [#9102](https://github.com/Applifier/unity-ads-webview/pull/9102)
* Revert Add MetaJoy's Android GameIds to V4 list [#9151](https://github.com/Applifier/unity-ads-webview/pull/9151)
* Revert MRAID close button styles fix [#9150](https://github.com/Applifier/unity-ads-webview/pull/9150)
* Revert Add CampaignId to CreativeBlocking Payload [#9152](https://github.com/Applifier/unity-ads-webview/pull/9152)
* Revert Minor Refactor to Tracking Events [#9100](https://github.com/Applifier/unity-ads-webview/pull/9100)

# Thu Apr 18 17:21:48 UTC 2019

* A/B test: Change order of the cta buttons on my choices page [#9101](https://github.com/Applifier/unity-ads-webview/pull/9101)
* Track Homescreen Consent Link Clicks with PTS [#9102](https://github.com/Applifier/unity-ads-webview/pull/9102)
* Add MetaJoy's Android GameIds to V4 list [#9151](https://github.com/Applifier/unity-ads-webview/pull/9151)
* MRAID close button styles fix [#9150](https://github.com/Applifier/unity-ads-webview/pull/9150)
* Add CampaignId to CreativeBlocking Payload [#9152](https://github.com/Applifier/unity-ads-webview/pull/9152)
* Minor Refactor to Tracking Events [#9100](https://github.com/Applifier/unity-ads-webview/pull/9100)

# Wed Apr 17 13:05:52 UTC 2019

* Stop all backup campaigns from production [#9126](https://github.com/Applifier/unity-ads-webview/pull/9126)
* Disable consent for limit ad tracking users [#9127](https://github.com/Applifier/unity-ads-webview/pull/9127)
* Remove the Skip Under Timer Experiment on Groups 7 and 8 [#9125](https://github.com/Applifier/unity-ads-webview/pull/9125)
* Always Show Consent UI if the Test Metadata is set [#9025](https://github.com/Applifier/unity-ads-webview/pull/9025)
* Correctly show number of campaigns received for Auction V5 [#9099](https://github.com/Applifier/unity-ads-webview/pull/9099)
* Add Polyfill for Object.values [#9103](https://github.com/Applifier/unity-ads-webview/pull/9103)

# Wed Apr 17 06:53:24 UTC 2019

* Progress bar overlay experiment in groups 5 & 6 [#8832](https://github.com/Applifier/unity-ads-webview/pull/8832)

# Fri Apr 12 07:05:28 UTC 2019

* Log iOS storage write event and remove Zynga custom feature [#9050](https://github.com/Applifier/unity-ads-webview/pull/9050)
* Force a specific auction protocol version [#8998](https://github.com/Applifier/unity-ads-webview/pull/8998)
* Add stages for tests and deployment [#9076](https://github.com/Applifier/unity-ads-webview/pull/9076)
* Test for disabling backup campaigns [#9077](https://github.com/Applifier/unity-ads-webview/pull/9077)

# Wed Apr 10 21:59:07 UTC 2019

* Remove custom kafka event from overlay install now button [#9051](https://github.com/Applifier/unity-ads-webview/pull/9051)
* Remove borders from Show my choices CTA button (A/B test) [#9052](https://github.com/Applifier/unity-ads-webview/pull/9052)
* Fix url cut off from multiple = character in query param [#9053](https://github.com/Applifier/unity-ads-webview/pull/9053)

# Tue Apr  9 07:52:29 UTC 2019

* Enable the 'Skip under timer experiment' as Zynga filtered AB test [#9024](https://github.com/Applifier/unity-ads-webview/pull/9024)
* Add More Games to the Auction V4 Games List [#9039](https://github.com/Applifier/unity-ads-webview/pull/9049)

# Fri Apr  5 18:04:16 UTC 2019

* Whitelist creatives for imply tracking for mraid [#9000](https://github.com/Applifier/unity-ads-webview/pull/9000)
* Remove VastParser in favor of VastParserStrict [#9002](https://github.com/Applifier/unity-ads-webview/pull/9002)
* Filtered abtest [#8906](https://github.com/Applifier/unity-ads-webview/pull/8906)

# Wed Apr  3 23:08:59 UTC 2019

* Add more games to use V4 [#8999](https://github.com/Applifier/unity-ads-webview/pull/8999)
* Replace consent title test with consent my choices button text test [#8997](https://github.com/Applifier/unity-ads-webview/pull/8997)
* Enable rewarded video overlay install now button for entire network [#8951](https://github.com/Applifier/unity-ads-webview/pull/8951)
* Removing duplicated code for setForcedGDPRBanner [#8833](https://github.com/Applifier/unity-ads-webview/pull/8833)
* Set URL parameters for Banner Consistently with Ads [#8953](https://github.com/Applifier/unity-ads-webview/pull/8953)
* Change Reporting Behavior to Reward from End Cards [#8975](https://github.com/Applifier/unity-ads-webview/pull/8975)

# Tue Apr  2 21:57:26 UTC 2019

* V4 for Fanatee games that has 87 placements [#8952](https://github.com/Applifier/unity-ads-webview/pull/8952)

# Mon Apr  1 23:35:56 UTC 2019

* Add Smart Banner Dimension Calculations [#8907](https://github.com/Applifier/unity-ads-webview/pull/8907)
* Update Campaign Errors to Normal Format for Auction V5 [#8929](https://github.com/Applifier/unity-ads-webview/pull/8929)

# Mon Apr  1 15:42:33 UTC 2019

* Auction V5 rollout, mostly affecting Android [#8885](https://github.com/Applifier/unity-ads-webview/pull/8885)

# Fri Mar 29 16:50:36 UTC 2019

* AR Delayed Camera Consent [#8326](https://github.com/Applifier/unity-ads-webview/pull/8326)

# Thu Mar 28 17:45:30 UTC 2019

* Disable skip under timer test until we have Zynga filter in place [#8860](https://github.com/Applifier/unity-ads-webview/pull/8860)
* Using ProgrammaictVastParserStrict in ProgrammaticVPAIDParser [#8883](https://github.com/Applifier/unity-ads-webview/pull/8883)
* Only Refresh catalog if promo exists in placement config [#8882](https://github.com/Applifier/unity-ads-webview/pull/8882)
* \<AdVerification\> as standalone tag and REASON code for VAST 4.1 [#8859](https://github.com/Applifier/unity-ads-webview/pull/8859)

# Tue Mar 26 20:58:25 UTC 2019

* Skip under timer experiment [#8835](https://github.com/Applifier/unity-ads-webview/pull/8835)
* Release VastParserStrict to AdMob and VPAID [#8836](https://github.com/Applifier/unity-ads-webview/pull/8836)
* Remove accessible close button tests [#8834](https://github.com/Applifier/unity-ads-webview/pull/8834)
* Parse \<AdVerifications\> for Open Measurement support [#8830](https://github.com/Applifier/unity-ads-webview/pull/8830)

# Fri Mar 22 01:15:43 UTC 2019

* VastParserStrict test for AdMob video and update some diagnostics logs [#8783](https://github.com/Applifier/unity-ads-webview/pull/8783)
* Fix Banner Ads Click Callback [#8784](https://github.com/Applifier/unity-ads-webview/pull/8784)
* A/B test previous consent title [#8807](https://github.com/Applifier/unity-ads-webview/pull/8807)

# Thu Mar 21 16:56:12 UTC 2019

* Set metadata serverUrl also to auction v5 [#8758](https://github.com/Applifier/unity-ads-webview/pull/8758)
* Promo supports missing orientation [#8736](https://github.com/Applifier/unity-ads-webview/pull/8736)
* Whitelist carnival creative for analytics [#8782](https://github.com/Applifier/unity-ads-webview/pull/8782)
* Promo background should cover entire background for iPhoneX [#8759](https://github.com/Applifier/unity-ads-webview/pull/8759)
* Use auction v4 if creativeUrl is used [#8806](https://github.com/Applifier/unity-ads-webview/pull/8806)
* Do not show Unity Consent in COPPA games [#8808](https://github.com/Applifier/unity-ads-webview/pull/8808)

# Tue Mar 19 23:37:16 UTC 2019

* Diagnostics for consent should be sampling at a 1% rate [#8760](https://github.com/Applifier/unity-ads-webview/pull/8760)

# Tue Mar 19 17:27:24 UTC 2019

* Introduce Observables utility class [#8475](https://github.com/Applifier/unity-ads-webview/pull/8475)
* More loggings and locking v5 for ios test games [#8735](https://github.com/Applifier/unity-ads-webview/pull/8735)
* Changing analytics to accept level index as a string rather than an int [#8733](https://github.com/Applifier/unity-ads-webview/pull/8733)
* Override Unity consent from metadata if present [#8683](https://github.com/Applifier/unity-ads-webview/pull/8683)

# Mon Mar 18 15:45:41 UTC 2019

* Diagnostics of READ_PHONE_STATE permission for China Android 1% [#8687](https://github.com/Applifier/unity-ads-webview/pull/8687)
* Making creativeType case agnostic [#8685](https://github.com/Applifier/unity-ads-webview/pull/8685)
* V5 Rolling out iOS and diagnostics for failed send events [#8688](https://github.com/Applifier/unity-ads-webview/pull/8688) 

# Fri Mar 15 14:46:01 UTC 2019

* Change consent layout [#8711](https://github.com/Applifier/unity-ads-webview/pull/8711)

# Fri Mar 15 12:36:40 UTC 2019

* Promo fix where landscape font size was incorrect [#8686](https://github.com/Applifier/unity-ads-webview/pull/8686)
* Fix the call to icon-size to use correct name [#8690](https://github.com/Applifier/unity-ads-webview/pull/8690)
* Additional fields for consent layout A/B tests [#8372](https://github.com/Applifier/unity-ads-webview/pull/8372)

# Thu Mar 14 08:37:20 UTC 2019

* Experiment to test more accessible mraid close button in playables [#8614](https://github.com/Applifier/unity-ads-webview/pull/8614)
* Show GDPR banner also in Performance VideoOverlay [#8637](https://github.com/Applifier/unity-ads-webview/pull/8637)
* Add Reverse AB Test for "install now" button in rewarded ads [#8522](https://github.com/Applifier/unity-ads-webview/pull/8522)
* Add Accessible close button test [#8471](https://github.com/Applifier/unity-ads-webview/pull/8471)
* Release abGroup 17 to roll out VastStrictParser for Programmatic Vast [#8680](https://github.com/Applifier/unity-ads-webview/pull/8680)
* Consolidate display adType to one [#8616](https://github.com/Applifier/unity-ads-webview/pull/8616)
* Add miller creativeid for analytics events [#8682](https://github.com/Applifier/unity-ads-webview/pull/8682)

# Tue Mar 12 21:19:07 UTC 2019

* Revert "Don't send operative clicks for Programmatic MRAID" [#8639](https://github.com/Applifier/unity-ads-webview/pull/8639)
* Restrict Auction V5 for request with over 10 placement [#8638](https://github.com/Applifier/unity-ads-webview/pull/8638)

# Tue Mar 12 01:05:27 UTC 2019

* VastParserStrict allow 'itms-apps://' protocol in urls [#8545](https://github.com/Applifier/unity-ads-webview/pull/8545)
* Fix styles for GDPR banner in video overlay [#8615](https://github.com/Applifier/unity-ads-webview/pull/8615)
* Improved server start stop [#8476](https://github.com/Applifier/unity-ads-webview/pull/8476)
* VastParserStrict allow StaticResource with "type" attribute to parse [#8544](https://github.com/Applifier/unity-ads-webview/pull/8544)
* Expose js console and errors + hook xmlhttprequest.open [#8298](https://github.com/Applifier/unity-ads-webview/pull/8298)

# Sat Mar  9 00:15:01 UTC 2019

* Adding session diagnostic for 10% of operative events that fail [#8591](https://github.com/Applifier/unity-ads-webview/pull/8591)
* Re-enable setting monetization flag when Monetization module is initialized [#8590](https://github.com/Applifier/unity-ads-webview/pull/8590)

# Fri Mar  8 04:20:03 UTC 2019

* Don't send operative clicks for Programmatic MRAID [#8567](https://github.com/Applifier/unity-ads-webview/pull/8567)

# Thu Mar  7 18:32:20 UTC 2019

* Initial support for IAP purchase detection [#8477](https://github.com/Applifier/unity-ads-webview/pull/8477)

# Thu Mar  7 12:37:10 UTC 2019

* Close icon instead of skip [#8450](https://github.com/Applifier/unity-ads-webview/pull/8450)

# Thu Mar  7 00:43:38 UTC 2019

* Fixing banner tests [#8520](https://github.com/Applifier/unity-ads-webview/pull/8520)

# Tue Mar  5 22:33:04 UTC 2019

* Enable timerless autobatching on all groups [#8422](https://github.com/Applifier/unity-ads-webview/pull/8422)
* Fix disabling backup campaigns with test metadata [#8370](https://github.com/Applifier/unity-ads-webview/pull/8370)
* Clear outdated user privacy before show [#8424](https://github.com/Applifier/unity-ads-webview/pull/8424)
* Swap ab group 16 with 18 for Auction v5 test [#8521](https://github.com/Applifier/unity-ads-webview/pull/8521)
* Hack in fix for 3.0.1 future deployments [#8419](https://github.com/Applifier/unity-ads-webview/pull/8419)

# Tue Mar  5 12:56:11 UTC 2019

* Remove ad_shown_in_background diagnostic [#8472](https://github.com/Applifier/unity-ads-webview/pull/8472)
* Remove click abtest and ByteDance hack, enable VastStrictParser test [#8474](https://github.com/Applifier/unity-ads-webview/pull/8474)

# Mon Mar  4 09:05:35 UTC 2019

* Update the consent flow [#8421](https://github.com/Applifier/unity-ads-webview/pull/8421)
* Replace the checkbox group with switches in PrivacySettings view [#8449](https://github.com/Applifier/unity-ads-webview/pull/8449)

# Thu Feb 28 23:58:23 UTC 2019

* Enable Admob HTTP Parsing for the full network [#8425](https://github.com/Applifier/unity-ads-webview/pull/8425)
* Add Test Adapter for Promo Test Mode [#8299](https://github.com/Applifier/unity-ads-webview/pull/8299)
* Update 3rd Party List [#8446](https://github.com/Applifier/unity-ads-webview/pull/8446)
* Release AB Test for Blocking campaign refresh with Auction Status Code [#8448](https://github.com/Applifier/unity-ads-webview/pull/8448)
* Close Privacy Settings view when clicking outside of the main content div [#8325](https://github.com/Applifier/unity-ads-webview/pull/8325)
* Add Banner Nofill Callback [#8420](https://github.com/Applifier/unity-ads-webview/pull/8420)

# Wed Feb 27 00:27:16 UTC 2019

* Remove Puchasing Diagnostics [#8414](https://github.com/Applifier/unity-ads-webview/pull/8418)

# Tue Feb 26 23:30:30 UTC 2019

* Update deprecated sandbox api with sinon.createSandbox() [#8396](https://github.com/Applifier/unity-ads-webview/pull/8396)
* Send Promo Catalog Flag to Auction [#8374](https://github.com/Applifier/unity-ads-webview/pull/8374)

# Tue Feb 26 17:47:06 UTC 2019

* Remove obsolete consent test code [#8373](https://github.com/Applifier/unity-ads-webview/pull/8373)
* Edit Admob HTTP Test to only block on bad response codes [#8371](https://github.com/Applifier/unity-ads-webview/pull/8371)
* Skipping redirection with redirectBreakers urls [#8349](https://github.com/Applifier/unity-ads-webview/pull/8349)

# Thu Feb 21 22:52:30 UTC 2019

* Update 3rd party list [#8350](https://github.com/Applifier/unity-ads-webview/pull/8350)
* Fix Privacy settings layout on iPhone X [#8300](https://github.com/Applifier/unity-ads-webview/pull/8300)
* Update Admob Parsing SessionDiagnostic [#8369](https://github.com/Applifier/unity-ads-webview/pull/8369)

# Wed Feb 20 21:17:27 UTC 2019

* Ping-Pong native bridge batching [#8153](https://github.com/Applifier/unity-ads-webview/pull/8153)
* Invalidate backup campaign if force campaign id is in use [#8324](https://github.com/Applifier/unity-ads-webview/pull/8324)
* Remove Dead Code [#8251](https://github.com/Applifier/unity-ads-webview/pull/8251)
* Remove support for promotions served by server [#8174](https://github.com/Applifier/unity-ads-webview/pull/8174)
* Add Group 16 to Auction V5 Test [#8348](https://github.com/Applifier/unity-ads-webview/pull/8348)
* Swap Bytedance AB Test and Reduce click_delay Diagnostic [#8347](https://github.com/Applifier/unity-ads-webview/pull/8347)

# Wed Feb 20 01:03:52 UTC 2019

* Add SessionDiagnostic for Admob HTTP Errors [#8297](https://github.com/Applifier/unity-ads-webview/pull/8297)
* Disable Vast Strict and Webplayer MRAID AB Tests on Groups 16 and 19 [#8303](https://github.com/Applifier/unity-ads-webview/pull/8303)
* Remove PTS Tracking of Missing Starts/Impressions [#8275](https://github.com/Applifier/unity-ads-webview/pull/8275)

# Mon Feb 18 15:04:30 UTC 2019

* Enable close icon skip also for Game7 games [#8273](https://github.com/Applifier/unity-ads-webview/pull/8273)
* Disable multithreading A/B test [#8206](https://github.com/Applifier/unity-ads-webview/pull/8206)
* Check DOM clean between tests [#8205](https://github.com/Applifier/unity-ads-webview/pull/8205)
* ABtest for campaign refresh with auction status code [#8148](https://github.com/Applifier/unity-ads-webview/pull/8148)

# Thu Feb 14 18:04:51 UTC 2019

* Fix issue in components.styl that turned stylint off without turning it back on [#8252](https://github.com/Applifier/unity-ads-webview/pull/8252)
* Take iPhone X series screen size better into use in performance ad endscreen [#8248](https://github.com/Applifier/unity-ads-webview/pull/8248)
* Extend the install now button experiment in rewarded ads to all devices in the designated AB group [#8202](https://github.com/Applifier/unity-ads-webview/pull/8202)

# Wed Feb 13 19:11:46 UTC 2019

* Merge China [#7825](https://github.com/Applifier/unity-ads-webview/pull/7825)

# Tue Feb 12 21:50:18 UTC 2019

* Consolidate vast url parsing into a single function [#8176](https://github.com/Applifier/unity-ads-webview/pull/8176)
* Add trace information for webplayer-mraid click diagnostics [#8175](https://github.com/Applifier/unity-ads-webview/pull/8175)
* Remove Purchasing Diagnostics [#8151](https://github.com/Applifier/unity-ads-webview/pull/8151)
* Enable Admob HTTP Parsing ABTest on Group 18 [#8203](https://github.com/Applifier/unity-ads-webview/pull/8203)
* Enable MRAID Webplayer ABTest on Group 19 [#8207](https://github.com/Applifier/unity-ads-webview/pull/8207)

# Mon Feb 11 17:59:20 UTC 2019

* Add deviceFreeSpace to video operative events [#8179](https://github.com/Applifier/unity-ads-webview/pull/8179)
* Change text of the Delete your data button [#8180](https://github.com/Applifier/unity-ads-webview/pull/8180)
* Add list of 3rd parties to the new privacy and consent views [#8177](https://github.com/Applifier/unity-ads-webview/pull/8177)
* Renamed NewVideoOverlay -> VideoOverlay, new-video-overlay -> video-overlay [#8152](https://github.com/Applifier/unity-ads-webview/pull/8152)
* Add close button to the new Privacy settigns view [#8106](https://github.com/Applifier/unity-ads-webview/pull/8106)

# Fri Feb  8 20:37:59 UTC 2019

* Install button experiment for rewarded ad videos [#8055](https://github.com/Applifier/unity-ads-webview/pull/8055)
* Update dependencies [#8054](https://github.com/Applifier/unity-ads-webview/pull/8054)

# Thu Feb  7 00:49:07 UTC 2019
* Fix connect to disconnect in MRAIDAdapterContainer [#8150](https://github.com/Applifier/unity-ads-webview/pull/8150)

# Wed Feb  6 17:45:38 UTC 2019

* Always enable multithreading (Android & iOS) and fix Android multithreading Request API except on group 17 [#8029](https://github.com/Applifier/unity-ads-webview/pull/8029)

# Wed Feb  6 01:02:05 UTC 2019

* Refactor Swipe Class into Separate Classes [#8028](https://github.com/Applifier/unity-ads-webview/pull/8028)
* Remove banner-auction-request_failed Diagnostic [#8105](https://github.com/Applifier/unity-ads-webview/pull/8105)
* Decode Url protocols in VastParserStrict [#8058](https://github.com/Applifier/unity-ads-webview/pull/8058)

# Mon Feb  4 23:58:18 UTC 2019

* Remove abTest for performance MRAID CTA handling [#8082](https://github.com/Applifier/unity-ads-webview/pull/8082)
* Remove Interstitial Layout AB Test [#8083](https://github.com/Applifier/unity-ads-webview/pull/8083)
* Ignore areControlsVisible in showCallButton [#8060](https://github.com/Applifier/unity-ads-webview/pull/8060)
* Prefix Release Scripts with Numbers [#8104](https://github.com/Applifier/unity-ads-webview/pull/8104)

# Mon Feb  4 15:46:43 UTC 2019

* Added diagnostics to consent show & send. For investigating a possible live issue. [#8061](https://github.com/Applifier/unity-ads-webview/pull/8061)

# Fri Feb  1 21:57:36 UTC 2019

* Support VAST CompanionClickTracking for end card click event [#8003](https://github.com/Applifier/unity-ads-webview/pull/8003)
* Improve Slack Webhooks and Increase Speed of Release Scripts [#8032](https://github.com/Applifier/unity-ads-webview/pull/8032)
* Adds a diagnostic if an ad is shown while app is in background [#8031](https://github.com/Applifier/unity-ads-webview/pull/8031)
* Reverse traffic control for ByteDance CTA AB test [#8056](https://github.com/Applifier/unity-ads-webview/pull/8056)
* Minor Fixes on Release Scripts [#8057](https://github.com/Applifier/unity-ads-webview/pull/8057)
* Add Initial BannerAdContext Tests [#8030](https://github.com/Applifier/unity-ads-webview/pull/8030)

# Thu Jan 31 04:33:07 UTC 2019

* Disabling offending hybrid tests [#8002](https://github.com/Applifier/unity-ads-webview/pull/8002)
* Cleanup CustomFeatures [#8004](https://github.com/Applifier/unity-ads-webview/pull/8004)
* ABTest: Custom Zynga Interstitial Video Overlay [#7981](https://github.com/Applifier/unity-ads-webview/pull/7981)
* Further Improve Staging Scripts [#8006](https://github.com/Applifier/unity-ads-webview/pull/8006)
* Vast Parser Strict Improvements : ignore unsupported companion ad types [#8005](https://github.com/Applifier/unity-ads-webview/pull/8005)
* Fix mraid being appended to DOM twice[#8027](https://github.com/Applifier/unity-ads-webview/pull/8027)

# Tue Jan 29 18:19:32 UTC 2019

* End screen improvements for the full network [#7890](https://github.com/Applifier/unity-ads-webview/pull/7890)
* WebPlayer MRAID with Disabled AB group [#7938](https://github.com/Applifier/unity-ads-webview/pull/7938)
* Refactor Privacy Code [#7934](https://github.com/Applifier/unity-ads-webview/pull/7934)
* Fix iOS cached file URLs when loading backup campaigns [#7980](https://github.com/Applifier/unity-ads-webview/pull/7980)

# Mon Jan 28 02:25:46 UTC 2019

* Splitting MRAIDEventHandler to Playable and Programmatic [#7780](https://github.com/Applifier/unity-ads-webview/pull/7780)

# Fri Jan 25 01:19:46 UTC 2019

* Staging Scripts Fixes [#7912](https://github.com/Applifier/unity-ads-webview/pull/7912)
* Promo adds greater UI flexibility [#7757](https://github.com/Applifier/unity-ads-webview/pull/7757)
* VPAID in VAST ad should parse as VPAID ad [#7932](https://github.com/Applifier/unity-ads-webview/pull/7932)

# Wed Jan 23 19:05:33 UTC 2019

* New GDPR Consent shown before ad show (not enabled in backend yet) [#7753](https://github.com/Applifier/unity-ads-webview/pull/7753)

# Wed Jan 23 02:00:42 UTC 2019

* Remove backupcampaign no fill investigation [#7886](https://github.com/Applifier/unity-ads-webview/pull/7886)
* Buffer swapping logic changes for ARView on Android [#7104](https://github.com/Applifier/unity-ads-webview/pull/7104)
* Fix PREPARE_ERROR missing js_errors from 2.0.5 downwards
* Add Bitmango game IDs to share Cheetah features [#7910](https://github.com/Applifier/unity-ads-webview/pull/7910)
* Support relative urls in VAST strict parser [#7887](https://github.com/Applifier/unity-ads-webview/pull/7887)
* Add Diagnostics for Missing Start Events [#7911](https://github.com/Applifier/unity-ads-webview/pull/7911)

# Sat Jan 19 01:17:37 UTC 2019

* Revert Hook Webplayer for MRAID [#7888](https://github.com/Applifier/unity-ads-webview/pull/7888)

# Thu Jan 17 18:50:39 UTC 2019

* Using new metric scheme for programmatic tracking events [#7866](https://github.com/Applifier/unity-ads-webview/pull/7866)
* Adding abGroup to ad_received, ad_ready and click_delay diagnostics log [#7865](https://github.com/Applifier/unity-ads-webview/pull/7865)
* Try timer based campaign expiration on Wargaming game [#7864](https://github.com/Applifier/unity-ads-webview/pull/7864)

# Wed Jan 16 16:08:20 UTC 2019

* add eventRetry=true to the URL parameters [#7659](https://github.com/Applifier/unity-ads-webview/pull/7659)
* add privacy to adreq and operative events [#7755](https://github.com/Applifier/unity-ads-webview/pull/7755)
* add gamePrivacy and userPrivacy to configuration [#7754](https://github.com/Applifier/unity-ads-webview/pull/7754)

# Wed Jan 16 11:12:06 UTC 2019

* Refactor store handlers for China [#7759](https://github.com/Applifier/unity-ads-webview/pull/7759)
* Define Staging/Deployment Process and Add QOL Scripts [#7464](https://github.com/Applifier/unity-ads-webview/pull/7464)
* Improved Diagnostics for Banner Lifecycle [#7779](https://github.com/Applifier/unity-ads-webview/pull/7779)


# Mon Jan 14 23:27:50 UTC 2019

* Send diagnostics when programmatic backup campaign gets overwritten with no fill [#7801](https://github.com/Applifier/unity-ads-webview/pull/7801)
* Rename OldCampaignRefreshManager to CampaignRefreshManager [#7821](https://github.com/Applifier/unity-ads-webview/pull/7821)
* Enable vast strict on group 16 [#7823](https://github.com/Applifier/unity-ads-webview/pull/7823)
* Enable auction v5 on group 15 [#7822](https://github.com/Applifier/unity-ads-webview/pull/7822)

# Mon Jan 14 12:40:31 UTC 2019

* Hook WebPlayer Programmatic MRAID 3.0 [#7614](https://github.com/Applifier/unity-ads-webview/pull/7614)
* Vast Events Integration Test [#7462](https://github.com/Applifier/unity-ads-webview/pull/7462)
* Add backup campaign flag to operative events [#7711](https://github.com/Applifier/unity-ads-webview/pull/7711)

# Thu Jan 10 23:34:08 UTC 2019

* Vast parser strict added but disabled through ab groups [#7407](https://github.com/Applifier/unity-ads-webview/pull/7407)

# Wed Jan 9 19:50:51 UTC 2019

* Using gameSessionId to sample fps counters [#7710](https://github.com/Applifier/unity-ads-webview/pull/7710)
* Reduce click delay log 100%->50% for ByteDance [#7724](https://github.com/Applifier/unity-ads-webview/pull/7724)
* Add new non-rewarded seatId and update abGroup for ByteDance [#7730](https://github.com/Applifier/unity-ads-webview/pull/7730)
* VAST media selector update to pick the lowest bitrate file [#7725](https://github.com/Applifier/unity-ads-webview/pull/7725)
* Removes the unnecessary parameters from parse method [#7542](https://github.com/Applifier/unity-ads-webview/pull/7542)
* Update GDPR text for retention period [#7728](https://github.com/Applifier/unity-ads-webview/pull/7728)
* Ensure Game was made with Unity before initializing Unity Purchasing Adapter [#7726](https://github.com/Applifier/unity-ads-webview/pull/7726) 

# Thu Dec 20 01:58:04 UTC 2018

* Increase log sampling to 50% and log performance mraid click delay [#7687](https://github.com/Applifier/unity-ads-webview/pull/7687)
* CI travis status update [#7684](https://github.com/Applifier/unity-ads-webview/pull/7684)
* Disabling report bad ads feature in GDPR regions [#7686](https://github.com/Applifier/unity-ads-webview/pull/7686)

# Wed Dec 19 00:50:07 UTC 2018

* AR analytics events [#7438](https://github.com/Applifier/unity-ads-webview/pull/7438)
* Remove back button experiment [#7520](https://github.com/Applifier/unity-ads-webview/pull/7520)
* Add support for cancel animation frame in AR [#7230](https://github.com/Applifier/unity-ads-webview/pull/7230)
* AR button timer  [#7461](https://github.com/Applifier/unity-ads-webview/pull/7461)
* Limit CTA ABTest to ByteDance Seat Only [#7681](https://github.com/Applifier/unity-ads-webview/pull/7681)
* Shifted Promo Template to Webview [#7467](https://github.com/Applifier/unity-ads-webview/pull/7467)
* Fire Promo Events in Staging [#7434](https://github.com/Applifier/unity-ads-webview/pull/7434)
* Fix PTS Endpoint for SDK Stats [#7683](https://github.com/Applifier/unity-ads-webview/pull/7683)

# Mon Dec 17 22:25:49 UTC 2018

* Disable auction v5 test for holidays from groups 15, 16 and 17 [#7611](https://github.com/Applifier/unity-ads-webview/pull/7611)
* Only store max three backup campaigns at the same time [#7610](https://github.com/Applifier/unity-ads-webview/pull/7610)
* Enable Bytedance A/B test [#7657](https://github.com/Applifier/unity-ads-webview/pull/7657)
* Add more information to Admob Stalled Diagnostic [#7658](https://github.com/Applifier/unity-ads-webview/pull/7658)

# Mon Dec 17 10:46:45 UTC 2018

* Disabled CTA abtest and sending video click events in endcard for ByteDance [#7615](https://github.com/Applifier/unity-ads-webview/pull/7615)
* Add 2861297 as Cheetah game [#7608](https://github.com/Applifier/unity-ads-webview/pull/7608)
* Ignore external JS errors [#7609](https://github.com/Applifier/unity-ads-webview/pull/7609)
* ABT-721 : Admob ads going straight to endcard [#7616](https://github.com/Applifier/unity-ads-webview/pull/7616)

# Fri Dec 14 11:32:11 UTC 2018

* Log click delay data for programmatic VAST/MRAID [#7587](https://github.com/Applifier/unity-ads-webview/pull/7587)

# Thu Dec 13 23:48:40 UTC 2018

* Fix video stuck / skipping ads through multitask button [#7564](https://github.com/Applifier/unity-ads-webview/pull/7564)
* Since ad unit style is optional field no need to send diagnostics [#7543](https://github.com/Applifier/unity-ads-webview/pull/7543)
* Add content type to campaign_expired diagnostic [#7565](https://github.com/Applifier/unity-ads-webview/pull/7565)
* Identify replayed job by ReplayCause [#7567](https://github.com/Applifier/unity-ads-webview/pull/7567)

# Thu Dec 13 11:03:45 UTC 2018

* Remove diagnostics logging for click rejection [#7463](https://github.com/Applifier/unity-ads-webview/pull/7463)
* Fix standalone cta button [#7436](https://github.com/Applifier/unity-ads-webview/pull/7436)
* Add onStartProcessed trigger for AdMobAdUnit [#7513](https://github.com/Applifier/unity-ads-webview/pull/7513)
* LoopMe MRAID Impression count experiment [#7468](https://github.com/Applifier/unity-ads-webview/pull/7468)
* Fix CI limit node label [#7541](https://github.com/Applifier/unity-ads-webview/pull/7541)
* Log promo error whenever creatives are not found [#7465](https://github.com/Applifier/unity-ads-webview/pull/7465)

# Wed Dec 12 10:27:59 UTC 2018

* Use env.revision for commit id [#7510](https://github.com/Applifier/unity-ads-webview/pull/7510)
* Add AdUnitParametersFactory to reduce clutter of Ads and AdUnitFactory [#7321](https://github.com/Applifier/unity-ads-webview/pull/7321)
* Remove Show install now button after 0,5s experiment [#7517](https://github.com/Applifier/unity-ads-webview/pull/7517)
* Add logic to use commit id of deployed webview [#7518](https://github.com/Applifier/unity-ads-webview/pull/7518)
* Refactor any to unknown [#7319](https://github.com/Applifier/unity-ads-webview/pull/7319)
* Send ad plan with configuration_ad_unit_style_parse_error diagnostic error [#7511](https://github.com/Applifier/unity-ads-webview/pull/7511)
* Use CHANGE_BRANCH instead of BRANCH_NAME [#7540](https://github.com/Applifier/unity-ads-webview/pull/7540)
* Revert "Ramp up Auction V5 to 45% of traffic [#7514](https://github.com/Applifier/unity-ads-webview/pull/7514)" (Back to 15% of traffic)

# Mon Dec 10 22:50:56 UTC 2018

* Ramp up Auction V5 to 45% of traffic [#7514](https://github.com/Applifier/unity-ads-webview/pull/7514)

# Mon Dec 10 13:52:58 UTC 2018

* Disable app sheet on iOS 12 [#7489](https://github.com/Applifier/unity-ads-webview/pull/7489)
* Make call-button start the transition from further off the screen [#7414](https://github.com/Applifier/unity-ads-webview/pull/7414)
* Remove the old Overlay [#7413](https://github.com/Applifier/unity-ads-webview/pull/7413)

# Fri Dec  7 06:02:24 UTC 2018

* Add unit tests for MRAID Ad Unit [#7318](https://github.com/Applifier/unity-ads-webview/pull/7318)
* Add WebPlayer MraidEvent Bridge (unhooked) [#7272](https://github.com/Applifier/unity-ads-webview/pull/7272)
* Extend Auction V5 Changes to Banners [#7439](https://github.com/Applifier/unity-ads-webview/pull/7439)
* Add Organic IAP Purchase [#7129](https://github.com/Applifier/unity-ads-webview/pull/7129)
* Relax \<Impression\> url check in Programmatic VAST [#7466](https://github.com/Applifier/unity-ads-webview/pull/7466)

# Wed Dec  5 21:38:02 UTC 2018

* More groups to auction v5 test [#7441](https://github.com/Applifier/unity-ads-webview/pull/7441)
* Clean up gamer ID from codebase [#7437](https://github.com/Applifier/unity-ads-webview/pull/7437)

# Mon Dec  3 21:13:08 UTC 2018

* Show install now button after 0,5s experiment [#7382](https://github.com/Applifier/unity-ads-webview/pull/7382)
* UADS-1002 : gamerSid should be included on all Operative events [#7173](https://github.com/Applifier/unity-ads-webview/pull/7173)
* Update dependencies [#7384](https://github.com/Applifier/unity-ads-webview/pull/7384)
* Fix autoskip, abgroup, country and other settings in the browser tester [#7409](https://github.com/Applifier/unity-ads-webview/pull/7409)
* Add Unity Analytics identifiers in config request [#7412](https://github.com/Applifier/unity-ads-webview/pull/7412)
* Add support for Creative Blocking Service [#7100](https://github.com/Applifier/unity-ads-webview/pull/7100)
* Enable Auction V5 on Group 15 [#7408](https://github.com/Applifier/unity-ads-webview/pull/7408)
* Style Privacy more Natively for Admob Ads [#7174](https://github.com/Applifier/unity-ads-webview/pull/7174)
* Android back button experiment [#7386](https://github.com/Applifier/unity-ads-webview/pull/7386)

# Thu Nov 29 22:28:30 UTC 2018

* Fix AR MRAID safety paddings on iPhone X [#6944](https://github.com/Applifier/unity-ads-webview/pull/6944)
* Remove skip icon experiment [#7383](https://github.com/Applifier/unity-ads-webview/pull/7383)
* Remove green button A/B test [#7342](https://github.com/Applifier/unity-ads-webview/pull/7342)
* Fix China Ad Watermark for Performance Ads with SquareEndScreen [#7406](https://github.com/Applifier/unity-ads-webview/pull/7406)

# Thu Nov 29 15:00:34 UTC 201

* Hotfix for missing iOS app background notification listener for SDK versions 2.0.3 - 2.3.0

# Thu Nov 29 10:53:37 UTC 2018

* Set web browser UA for click event in programmatic VAST and MRAID [#7362](https://github.com/Applifier/unity-ads-webview/pull/7362)
* Refactor ABGroup and limit tests to groups 5-19 [#7101](https://github.com/Applifier/unity-ads-webview/pull/7101)
* Fix VAST/VPAID Tracking for Auction V5 [#7322](https://github.com/Applifier/unity-ads-webview/pull/7322)

# Wed Nov 28 22:24:34 UTC 2018

* Read Unity Analytics identifiers from Unity Engine [#7274](https://github.com/Applifier/unity-ads-webview/pull/7274)

# Wed Nov 28 13:03:18 UTC 2018

* Add 广告 to Overlays for China Ads [#7102](https://github.com/Applifier/unity-ads-webview/pull/7102)

# Mon Nov 26 23:00:23 UTC 2018

* Revert Tracking Urls Changes for VAST and Disable Auction V5 [#7317](https://github.com/Applifier/unity-ads-webview/pull/7317)
* BYOP Promo Product Type Filtering [#7073](https://github.com/Applifier/unity-ads-webview/pull/7073)
* Refactor Vast Overlay and Privacy [#6890](https://github.com/Applifier/unity-ads-webview/pull/6890)
* Fix logic that show call button only for VAST [#7296](https://github.com/Applifier/unity-ads-webview/pull/7296)
* Update Privacy Naming and User Summary Endpoints in GCP [#7127](https://github.com/Applifier/unity-ads-webview/pull/7127)

# Mon Nov 26 09:36:32 UTC 2018

* Type out IInfoJson & fix undefined sessionId [#7275](https://github.com/Applifier/unity-ads-webview/pull/7275)
* Disable backup campaigns on pre-4.4. Androids [#7276](https://github.com/Applifier/unity-ads-webview/pull/7276)

# Wed Nov 21 20:44:19 UTC 2018

* Don't show mute and CTA button on top of GDPR banner in video overlay [#7252](https://github.com/Applifier/unity-ads-webview/pull/7252)
* Fix CTA button logic in closable video overlay [#7251](https://github.com/Applifier/unity-ads-webview/pull/7251)

# Wed Nov 21 15:11:04 UTC 2018

* VAST media selector rollout [#7225](https://github.com/Applifier/unity-ads-webview/pull/7225)
* Fix broken AR events [#7227](https://github.com/Applifier/unity-ads-webview/pull/7227)
* Fix firing VAST tracking events from Auction [#7226](https://github.com/Applifier/unity-ads-webview/pull/7226)
* Add auctionType for placements from config service [#7098](https://github.com/Applifier/unity-ads-webview/pull/7098)
* Fix rejected HEAD request for followRedirectChain [#7179](https://github.com/Applifier/unity-ads-webview/pull/7179)
* Game session counters: send state of last adrequest [#7107](https://github.com/Applifier/unity-ads-webview/pull/7107)
* Test new Travis VM based infra [#7228](https://github.com/Applifier/unity-ads-webview/pull/7228)
* Remove SCREEN_OFF broadcast [#7229](https://github.com/Applifier/unity-ads-webview/pull/7229)

# Wed Nov 21 00:12:25 UTC 2018

* Auction V5 Test Disabled for Thanksgiving (No PR)
* Set tracking URLs before showing (auction v5 fix) [#7223](https://github.com/Applifier/unity-ads-webview/pull/7223)
* Show the call button in fadeIn for other than performance and xpromo campaigns [#7182](https://github.com/Applifier/unity-ads-webview/pull/7182)
* Fix scrollable overlay with MOAT [#7183](https://github.com/Applifier/unity-ads-webview/pull/7183)

# Tue Nov 20 13:57:19 UTC 2018

* Stop auction v5 in group 15 [#7203](https://github.com/Applifier/unity-ads-webview/pull/7203)

# Tue Nov 20 12:53:13 UTC 2018

* Fix broken build info screen [#7178](https://github.com/Applifier/unity-ads-webview/pull/7178)
* Harden Auction V5 Parser Against No fill Parse Failures [#7177](https://github.com/Applifier/unity-ads-webview/pull/7177)
* IFrame Event Bridge for MRAID Views [#7013](https://github.com/Applifier/unity-ads-webview/pull/7013)
* Switch the skip icon test to use 'next' icon [#7180](https://github.com/Applifier/unity-ads-webview/pull/7180)
* Second experiment on different green colors on Android [#7181](https://github.com/Applifier/unity-ads-webview/pull/7181)

# Mon Nov 19 2018

* Modularize restructured codebase [#6892](https://github.com/Applifier/unity-ads-webview/pull/6892)

# Wed Nov 14 19:05:17 UTC 2018

* Enable auction v5 A/B test for one group [#7130](https://github.com/Applifier/unity-ads-webview/pull/7130)

# Tue Nov 13 23:39:14 UTC 2018

* Fix Integration Test Exit Code [#7095](https://github.com/Applifier/unity-ads-webview/pull/7095)
* Rename PlayableMRAID to ExtendedMRAID [#6942](https://github.com/Applifier/unity-ads-webview/pull/6942)
* Add TSLint Whitespace [#7097](https://github.com/Applifier/unity-ads-webview/pull/7097)
* Reduce font size for ExtendedMRAID permission text [#7099](https://github.com/Applifier/unity-ads-webview/pull/7099)
* Add TSLint array-type [#7096](https://github.com/Applifier/unity-ads-webview/pull/7096)
* Add 'Install Now' button to All Performance and XPromo Videos [#6947](https://github.com/Applifier/unity-ads-webview/pull/6947)
* Add Disabled Auction V5 Protocol Test [#6896](https://github.com/Applifier/unity-ads-webview/pull/6896)
* Fix Backup Campaign Loading Promise chain [#7106](https://github.com/Applifier/unity-ads-webview/pull/7106)

# Thu Nov  8 14:32:20 UTC 2018

* Load square asset when constructing backup campaign [#7074](https://github.com/Applifier/unity-ads-webview/pull/7074)

# Thu Nov  8 11:34:51 UTC 2018

* Move trackingUrls to base Campaign model [#7053](https://github.com/Applifier/unity-ads-webview/pull/7053)
* Fix OrganizationID Description [#6941](https://github.com/Applifier/unity-ads-webview/pull/6941)

# Wed Nov  7 18:30:55 UTC 2018

* AB test for different green shades on Android CTA button [#6891](https://github.com/Applifier/unity-ads-webview/pull/6891)

# Wed Nov  7 13:47:22 UTC 2018

* Use proper keyname for WebPlayer returnValue [#7012](https://github.com/Applifier/unity-ads-webview/pull/7012)
* Revert TSLint : no-parameter-reassignment [#6897](https://github.com/Applifier/unity-ads-webview/pull/6897)
* Fix GDPR Banner for AR MRAID [#6943](https://github.com/Applifier/unity-ads-webview/pull/6943)
* Log Promo error whenever no creatives detected [#6803](https://github.com/Applifier/unity-ads-webview/pull/6803)
* Respect iPhone x safe areas for Admob [#6989](https://github.com/Applifier/unity-ads-webview/pull/6989)
* Refactor Banner Ad Unit [#6889](https://github.com/Applifier/unity-ads-webview/pull/6889)

# Tue Nov  6 21:05:41 UTC 2018

* Exit skip button test [#6991](https://github.com/Applifier/unity-ads-webview/pull/6991)
* Revert skippable rewarded ads test [#6990](https://github.com/Applifier/unity-ads-webview/pull/6990)
* SafeDK hacks [#6992](https://github.com/Applifier/unity-ads-webview/pull/6992)
* Add a global afterEach which restores sinon default sandbox [#6968](https://github.com/Applifier/unity-ads-webview/pull/6968)

# Tue Nov  6 11:53:35 UTC 2018

* TSLint no-relative-imports [#6888](https://github.com/Applifier/unity-ads-webview/pull/6888)
* Remove feature flag test for vast3 error tracking [#6895](https://github.com/Applifier/unity-ads-webview/pull/6895)
* Update AR styling for iPhoneX and Info button [#6837](https://github.com/Applifier/unity-ads-webview/pull/6837)
* MRAID Views Refactor [#6775](https://github.com/Applifier/unity-ads-webview/pull/6775)
* Resize MRAID Views [#6782](https://github.com/Applifier/unity-ads-webview/pull/6782)

# Mon Nov  5 13:44:02 UTC 2018

* Block file URLs from all Request and Cache API invocations [#6948](https://github.com/Applifier/unity-ads-webview/pull/6948)

# Thu Nov  1 20:15:06 UTC 2018

* Use X as skip icon experiment [#6920](https://github.com/Applifier/unity-ads-webview/pull/6920)
* Remove early CTA button experiment [#6918](https://github.com/Applifier/unity-ads-webview/pull/6918)

# Wed Oct 31 23:02:03 UTC 2018

* Refactor AdUnitFactory [#6834](https://github.com/Applifier/unity-ads-webview/pull/6834)
* Remove expired ab group test for click delay [#6861](https://github.com/Applifier/unity-ads-webview/pull/6861)
* Fix error diagnostics for Content Types [#6862](https://github.com/Applifier/unity-ads-webview/pull/6862)
* Update Error handling for Videos over 40 seconds [#6886](https://github.com/Applifier/unity-ads-webview/pull/6886)
* Vast media selector abTest using auction feature flag [#6859](https://github.com/Applifier/unity-ads-webview/pull/6859)
* Encode VAST Wrapper URI with params [#6858](https://github.com/Applifier/unity-ads-webview/pull/6858)
* Refactor BannerAdUnitParametersFactory to remove unused parameters [#6860](https://github.com/Applifier/unity-ads-webview/pull/6860)

# Tue Oct 30 17:52:40 UTC 2018

* Fix Privacy layout on iPhone X series [#6863](https://github.com/Applifier/unity-ads-webview/pull/6863)
* iPhone XR media queries [#6864](https://github.com/Applifier/unity-ads-webview/pull/6864)
* Square end screen asset support [#6838](https://github.com/Applifier/unity-ads-webview/pull/6838)
* Experiment: Skippable Rewarded Ads [#6806](https://github.com/Applifier/unity-ads-webview/pull/6806)
* Log Promotions without product [#6780](https://github.com/Applifier/unity-ads-webview/pull/6780)

# Mon Oct 29 21:07:45 UTC 2018

* Refactor Backend to non-static [#6835](https://github.com/Applifier/unity-ads-webview/pull/6835)
* Quality-of-life improvements for debugging [#6836](https://github.com/Applifier/unity-ads-webview/pull/6836)
* Delete backup campaigns when showing an ad [#6833](https://github.com/Applifier/unity-ads-webview/pull/6833)
* Remove autobatching exception for game ID 1448666 [#6832](https://github.com/Applifier/unity-ads-webview/pull/6832)
* Remove APK download link hack [#6677](https://github.com/Applifier/unity-ads-webview/pull/6677)
* VastErrorHandler supporting VAST 3.0, ready for abTest [#6812](https://github.com/Applifier/unity-ads-webview/pull/6812)
* Remove web search intent for opening appDownloadUrl [#6810](https://github.com/Applifier/unity-ads-webview/pull/6810)

# Thu Oct 25 21:49:17 UTC 2018

* Remove old backup campaign implementation, use new as default [#6778](https://github.com/Applifier/unity-ads-webview/pull/6778)
* A/B test CTA Button on Video Overlay v2 [#6807](https://github.com/Applifier/unity-ads-webview/pull/6807)
* Remove endscreen layout A/B test [#6805](https://github.com/Applifier/unity-ads-webview/pull/6805)
* TSLint no-parameter-reassignment [#6777](https://github.com/Applifier/unity-ads-webview/pull/6777) 

# Wed Oct 24 17:13:55 UTC 2018

* Enable x icon skip for Cheetah [#6781](https://github.com/Applifier/unity-ads-webview/pull/6781)
* AR logo cropping fix [#6783](https://github.com/Applifier/unity-ads-webview/pull/6783)
* Remove mixed placement experiment dead code [#6779](https://github.com/Applifier/unity-ads-webview/pull/6779)
* Use StorageBridge with BackupCampaignManager [#6769](https://github.com/Applifier/unity-ads-webview/pull/6769)
* Native flag added to promo events [#6705](https://github.com/Applifier/unity-ads-webview/pull/6705)
* TSLint: one-variable-per-declaration [#6772](https://github.com/Applifier/unity-ads-webview/pull/6772)
* TSLint: no-single-line-black-comment [#6770](https://github.com/Applifier/unity-ads-webview/pull/6770)
* Fix product type to only be appended to iap tracking events [#6706](https://github.com/Applifier/unity-ads-webview/pull/6706)
* Minor adjustments to Reported Ads [#6771](https://github.com/Applifier/unity-ads-webview/pull/6771)

# Thu Oct 18 17:01:37 UTC 2018

* Test CTA button in video overlay [#6403](https://github.com/Applifier/unity-ads-webview/pull/6403)

# Thu Oct 18 10:52:21 UTC 2018

* MediaFile selection based on file size for VAST, ready for auction abTest [#6547](https://github.com/Applifier/unity-ads-webview/pull/6547)
* Remove CachedAdmobCampaign [#6681](https://github.com/Applifier/unity-ads-webview/pull/6681)
* Switch AB groups for the Improved endscreen styles test [#6728](https://github.com/Applifier/unity-ads-webview/pull/6726)
* Move Promo models to Promo Module [#6728](https://github.com/Applifier/unity-ads-webview/pull/6728)
* Allow streaming of backup campaigns [#6727](https://github.com/Applifier/unity-ads-webview/pull/6727)
* Update promo parse to use IAP Product ID as a fallback [#6730](https://github.com/Applifier/unity-ads-webview/pull/6730)

# Wed Oct 17 18:20:47 UTC 2018

* Add support for all SDK 3.0.0 Webview Functionality: [List of PRs](https://github.com/Applifier/unity-ads-webview/pulls?q=is%3Apr+is%3Aclosed+label%3A3.0)

# Tue Oct 16 12:43:43 UTC 2018

* Minor optimizations to backup campaign implementation [#6676](https://github.com/Applifier/unity-ads-webview/pull/6676)
* Enable Android back button on Closable video overlay for Cheetah [#6679](https://github.com/Applifier/unity-ads-webview/pull/6679)

# Mon Oct 15 20:37:20 UTC 2018

* AB Test various improvements to the endscreen layout v2 [#6674](https://github.com/Applifier/unity-ads-webview/pull/6674)
* Remove smart close button test [#6673](https://github.com/Applifier/unity-ads-webview/pull/6673)
* Android back button skip for Cheetah [#6675](https://github.com/Applifier/unity-ads-webview/pull/6675)
* Add check that requested permissions are in manifest [#6358](https://github.com/Applifier/unity-ads-webview/pull/6358)
* Add tests for AR and Permission APIs [#6495](https://github.com/Applifier/unity-ads-webview/pull/6495)
* Add method to set authorization header for http request from Webview [#6379](https://github.com/Applifier/unity-ads-webview/pull/6379)
* Remove calling getSensorList API method on initialization [#6541](https://github.com/Applifier/unity-ads-webview/pull/6541)
* Remove OpenGL version from DeviceInfo [#6651](https://github.com/Applifier/unity-ads-webview/pull/6651)
* Show target information in Non-GDPR Privacy Dialog [#6646](https://github.com/Applifier/unity-ads-webview/pull/6646)
* Add error throwing when API is missing in browser build [#6604](https://github.com/Applifier/unity-ads-webview/pull/6604)
* Add isCached checking support for Admob Campaigns [#6652](https://github.com/Applifier/unity-ads-webview/pull/6652)

# Wed Oct 10 17:36:31 UTC 2018

* Multiply battery level by 100 for AdMob signal [#6600](https://github.com/Applifier/unity-ads-webview/pull/6600)
* ABTest for click tracking swap, request from CrossInstall [#6598](https://github.com/Applifier/unity-ads-webview/pull/6598)
* Fix AdMob campaign loader [#6647](https://github.com/Applifier/unity-ads-webview/pull/6647)

# Tue Oct  9 21:46:34 UTC 2018

* Improve/Rename Reporting Privacy and Remove Other Privacies [#6601](https://github.com/Applifier/unity-ads-webview/pull/6601)
* Improvements to Banner Lifecycle Logic [#6596](https://github.com/Applifier/unity-ads-webview/pull/6596)
* Batching storage modifications and writes [#6454](https://github.com/Applifier/unity-ads-webview/pull/6545)
* Use Allow Skip Flag from Configuration for Rewarded Promo [#6552](https://github.com/Applifier/unity-ads-webview/pull/6552)
* Never serialize Asset model Session object [#6603](https://github.com/Applifier/unity-ads-webview/pull/6603)

# Mon Oct  8 23:15:42 UTC 2018

* AB Test various improvements to the endscreen layout in groups 16 & 17 [#6556](https://github.com/Applifier/unity-ads-webview/pull/6556)
* AB Test Smart Close button in groups 18 & 19 [#6238](https://github.com/Applifier/unity-ads-webview/pull/6238) 
* Fix session ad plan loading for backup campaigns [#6595](https://github.com/Applifier/unity-ads-webview/pull/6595)
* Removed CTA button color test from groups 16, 17, 18 & 19 [#6472](https://github.com/Applifier/unity-ads-webview/pull/6576/)

# Fri Oct  5 21:40:11 UTC 2018

* Enable Reporting Privacy for All [#6575](https://github.com/Applifier/unity-ads-webview/pull/6575)
* Support serialization for MRAID campaigns [#6549](https://github.com/Applifier/unity-ads-webview/pull/6549)
* Remove Ads deps from Core [#6544](https://github.com/Applifier/unity-ads-webview/pull/6544)
* Add CSS media queries for iPhone XS Max [#6543](https://github.com/Applifier/unity-ads-webview/pull/6543)
* Disable Report Bad Ads A/B test [#6550](https://github.com/Applifier/unity-ads-webview/pull/6550)
* Fix AR permission dialog's styles [#6384](https://github.com/Applifier/unity-ads-webview/pull/6384)
* Add abGroup to playable kpi events [#6555](https://github.com/Applifier/unity-ads-webview/pull/6555)
* Update AR logo [#6497](https://github.com/Applifier/unity-ads-webview/pull/6497)
* add missing 'supports' in MRAID container and remove one logWarning [#6540](https://github.com/Applifier/unity-ads-webview/pull/6540)

# Mon Oct  1 11:33:41 UTC 2018

* Enable close icon skip for specific game IDs [#6520](https://github.com/Applifier/unity-ads-webview/pull/6520)

# Fri Sep 28 12:37:23 UTC 2018

* Always enable autobatching for game ID 1448666 [#6498](https://github.com/Applifier/unity-ads-webview/pull/6498)

# Thu Sep 27 13:33:54 UTC 2018

* Refactor backup campaign implementation [#6407](https://github.com/Applifier/unity-ads-webview/pull/6407)
* Re-run CTA button color experiment with 4 A/B group and 4 colors. Each A/B group should have one assigned color for download button (groups 16, 17, 18 & 19) [#6472](https://github.com/Applifier/unity-ads-webview/pull/6472)
* Add metadata to force GDPR banner to be visible [#6451](https://github.com/Applifier/unity-ads-webview/pull/6451)

# Wed Sep 26 21:14:54 UTC 2018

* Temporarily remove Mixed Placement functionality and tests [#6474](https://github.com/Applifier/unity-ads-webview/pull/6474)

# Wed Sep 26 09:51:45 UTC 2018

* Reporting Bad Ads AB Test Groups 11/12 [#6297](https://github.com/Applifier/unity-ads-webview/pull/6297)
* Move Tencent Logo to Top-left Corner [#6409](https://github.com/Applifier/unity-ads-webview/pull/6409)

# Tue Sep 25 18:29:10 UTC 2018

* Remove Ads dependencies from Core [#6335](https://github.com/Applifier/unity-ads-webview/pull/6335)

# Mon Sep 24 09:44:02 UTC 2018 

* Enable close icon skip for specific game IDs [#6406](https://github.com/Applifier/unity-ads-webview/pull/6406)

# Fri Sep 21 09:07:42 UTC 2018

* Use 'display' style to hide and show video-overlay content [#6382](https://github.com/Applifier/unity-ads-webview/pull/6382)
* Fix audio route change handling on iOS [#6383](https://github.com/Applifier/unity-ads-webview/pull/6383)

# Wed Sep 19 06:56:59 UTC 2018

* Recognize standalone_android store type and appDownloadUrl parameter from Auction [#6029](https://github.com/Applifier/unity-ads-webview/pull/6029)
* Fix playable KPI background time [#6275](https://github.com/Applifier/unity-ads-webview/pull/6275)
* Check if VPAID Endcard exists in DOM before attempting to remove it [#6266](https://github.com/Applifier/unity-ads-webview/pull/6266)

# Mon Sep 17 20:48:18 UTC 2018

* Remove Admob Video Caching AB Test
* Add 广告 to Overlays for Tencent Ads
* Move platform logic away from API class
* Serializable campaign models
* Parse new comet content types
* Use a longer safeguard timeout for showCameraFeed

# Mon Sep 17 08:00:27 UTC 2018

* Enable new video overlay for all
* Fix: VAST end screen not visible after video errors (black screen)

# Fri Sep 14 17:45:45 UTC 2018

* Remove Kefir gameIDs from Personalized Placement Experiement

# Wed Sep 12 21:48:07 UTC 2018

* Hellfest Creative temporary creative ID Whitelist [#6296](https://github.com/Applifier/unity-ads-webview/pull/6296)

# Tue Sep 11 11:48:04 UTC 2018

* Disable Request.setConcurrentRequestCount on iOS SDK 2.3.0 to prevent crashes with iOS 12 [#6299](https://github.com/Applifier/unity-ads-webview/pull/6299)

# Mon Sep 10 09:54:48 UTC 2018

* Replace the skip icon with the close icon for Cheetah's Clean Master [#6268](https://github.com/Applifier/unity-ads-webview/pull/6268)
* Show GDPR Privacy on the VAST end screen if GDPR enabled [#6246](https://github.com/Applifier/unity-ads-webview/pull/6246)
* Hide GDPR banner after click on performance end screen. Make gdpr icon clickable in banner [#6270](https://github.com/Applifier/unity-ads-webview/pull/6270)
* Add gameids for Mixed Placement experiment [#6243](https://github.com/Applifier/unity-ads-webview/pull/6243)

# Thu Sep  6 09:26:17 UTC 2018

* Restructure codebase

# Tue Sep  4 09:16:55 UTC 2018

* Fix playable analytics naming
* Fix playable ads KPI metrics
* Reformat build information in privacy objects

# Thu Aug 30 15:02:10 UTC 2018

* Remove webview reinit logic
* AR fixes
* Isolate integration tests
* Fix global leaks in hybrid tests

# Wed Aug 29 12:27:38 UTC 2018

* Refactor build & test systems

# Tue Aug 28 08:46:33 UTC 2018

* Add Augmented Reality(AR) Ads Support
* Prevent multiple CTA Clicks on MRAID
* Add AB Test requiring Admob Video as a Required Asset
* Replace URL Parameters correctly for Performance tracking urls

# Thu Aug 23 22:15:10 UTC 2018

* Make jaeger more robust on init
* XPROMO: trigger onStartProcessed after the start event has been sent
* New video overlay also enabled for VAST video ads in groups 18 & 19
* Custom Feature for Admob Video Required Asset
* Remove iPhone X end screen test (groups 18 & 19)

# Wed Aug 22 09:36:53 UTC 2018

* Remove force quit manager
* Start the VPAID timeout timer to hide ad unit on bad ads

# Tue Aug 21 06:56:04 UTC 2018

* Fix display interstitial click area
* Rename comet tracking loaded event
* Fix Vast Endscreen click delay
* Fix VPAID click and Endscreen
* Add creativeId and targetStoreId in XPromo Operative Events

# Fri Aug 17 11:23:03 UTC 2018

* Fix force_quit deletion
* Collect average fps for mraid
* Improve caching time and add mraid parse time

# Thu Aug 16 21:25:14 UTC 2018

* Change comet tracking url names

# Thu Aug 16 11:46:08 UTC 2018

* Add Product type to promo tracking event urls
* Reduce number of catalog refresh calls to IAP
* Fix forcequit diagnostic sending error

# Wed Aug 15 05:57:24 UTC 2018

* Banner implementation merged to 3.0.0
* Add tracking URL events for Performance Campaigns

# Tue Aug 14 20:02:05 UTC 2018

* Send a diagnostic event if the mraid creation fails
* Reset the app sheet when closing the ad unit
* Merge out changes related to modularization refactoring
* Fix tests if XHRequest is used to fetch MRAIDs

# Thu Aug  9 23:04:44 UTC 2018

* Send creativeView tracking event for companionAd using Vast model api

# Wed Aug  8 08:40:08 UTC 2018

* Destroy Forcequit Key only after container cleanly closes
* Remove ComScore Completely
* Encode Impression tracking urls of Programmatic VAST
* Added the field latestCampaignsStarts in gameSessionCounters
* Send close and skip events for playable mraid

# Tue Aug  7 13:23:57 UTC 2018

* Update Dependencies

# Thu Aug  2 23:00:48 UTC 2018

* Remove ability to seek in Admob videos
* Add diagnostic message if a user attempts to seek in Admob
* Remove GamerID from source code

# Thu Aug  2 10:32:18 UTC 2018

* iPhone X Endscreen test on ABGroups 18 and 19
* Forcequit Manager added to track abnormal ad termination
* Remove ABGroup from Campaign model
* Tslint prefer-method-signature
* Revert CustomFeature change for Uken Games
* Align Admob start events for rewarded and interstitial videos
* Use segno to create QR code for local Webview
* Refactor Endscreen constructor parameter list

# Mon Jul 30 21:52:01 UTC 2018

* Fix GDPR Privacy width for iPhone X in landscape
* Sending unity internal tracking events for clicks after followRedirectChain
* Tslint number-literal-format
* Sonic Creative temporary creative ID Whitelist

# Wed Jul 25 20:12:52 UTC 2018

* New GDPR legal text
* Fixed issues with backup campaign, expired campaigns were shown, VAST had issues

# Tue Jul 24 20:57:31 UTC 2018

* Add a fixed version of the new video overlay
* Send Admob impression when ad loads
* Expanding Localization regex to be more flexible for Chinese
* Tslint no-unnecessary-qualifier
* Tslint no-unnecessary-type-assertion
* Tslint use-default-type-parameter
* Tslint type-literal-delimiter
* Tslint no-function-expression

# Fri Jul 20 21:20:03 UTC 2018

* Not using cached adPlan for Uken games - attempt to fix black screen issue

# Fri Jul 20 07:37:21 UTC 2018

* Revert "Merge pull request #5566 from Applifier/feature/new-video-overlay
* Handle Promo initialization order over SendEvent
* Tslint no-multiline-string

# Thu Jul 19 20:07:08 UTC 2018

* Add more parameters to AbstractPrivacy Build Information
* Remove new square endscreen image test
* Add ABGroup parameter to auction request body
* Tslint no-unnecessary-field-initialization
* Tslint no-unnecessary-override

# Wed Jul 18 19:58:01 UTC 2018

* Tslint no-irregular-whitespace
* Tslint no-spaces-in-parens
* Tslint no-use-before-declare re-enabled
* Send admob cache metrics to PTS

# Mon Jul 16 20:03:32 UTC 2018

* Tslint no-unnecessary-local-variable is re-enabled
* Tslint no-invalid-this is re-enabled
* New Video Overlay for Performance on ABGroups 16 and 17

# Wed Jul 11 21:24:48 UTC 2018

* Send too_large_file errors to programmatic tracking service

# Wed Jul 11 12:45:00 UTC 2018

* Revert previous deployment

# Wed Jul 11 12:31:27 UTC 2018

* Feature list and measurements A/B test in group 16

# Wed Jul 11 06:36:59 UTC 2018

* Re-enable Microsoft linter rule, no break in default in switch
* Remove gamerId from configuration request
* Create a separate event handler for GDPR skip events

# Thu Jul  5 15:21:01 UTC 2018

* Test for campaign parsing and caching success rates

# Wed Jul  4 09:26:35 UTC 2018

* Remove the fancy endscreen test from groups 16 and 17
* Re-enable tslint default in switch rule

# Tue Jul  3 12:34:47 UTC 2018

* Parse creative ids from the ad request response and pass used creativeId in operative events

# Tue Jul  3 05:00:01 UTC 2018

* Mixed Placement Experiment version 2
* AB testing for CTA behavior - directly open web browser vs handling redirects in webview (groups 11 & 12)
* Enable tslint no duplicate imports rule

# Mon Jul  2 06:15:21 UTC 2018

* Fix IAP Promo payload initialization check
* Add configuration url to playable configuration diagnostic message

# Fri Jun 29 04:54:56 UTC 2018

* Fix race condition in iOS video start event logic
* Fix js_error when args is not an array or is undefined or null
* tslint trailing comma removal

# Wed Jun 27 22:04:48 UTC 2018

* Change handling of crosspromo third quartile event

# Wed Jun 27 06:05:33 UTC 2018

* Remove circular dependencies
* Fix iOS 7.x appsheet problems by sending user to the browser 
* Fix new js_error that surfaced by because of fixing the c.join js_error 

# Tue Jun 26 08:23:00 UTC 2018

* Revert previous deployment

# Tue Jun 26 05:40:10 UTC 2018

* Use the included microsoft typescript linting rules
* Add promo initialization check before attempting to parse a promo campaign

# Mon Jun 25 22:21:06 UTC 2018

* Never send Android ID with advertising ID in operative events
* New square endscreen image test in groups 18 and 19
* Reduce JS errors

# Thu Jun 21 09:14:47 UTC 2018

* Pinpoint promo_version_not_supported errors
* Custom fix for Baidu: Close ad units when going background on iOS
* Address apparent regressions in MOAT Functionality
* Fix iOS onAppForeGround discrepancy

# Wed Jun 20 20:13:28 UTC 2018

* Remove playable endscreen A/B test from groups 18 and 19
* Reduce JS errors

# Wed Jun 20 10:38:12 UTC 2018

* Check GDPR consent metadata only when GDPR is enabled in configuration
* Use ssl for jaeger tracing

# Tue Jun 19 20:34:19 UTC 2018

* Optimized unnecessarily large GDPR radio buttons
* Refactor resending failed operative events
* Use shared tslib
* Initial support for multithreaded Request API

# Mon Jun 18 09:51:31 UTC 2018

* Send xpromo third quartile event
* Run tslint before compiling TypeScript
* Enable apk hashing / apk digest for 2.2.1 and above

# Thu Jun 14 20:14:43 UTC 2018

* Add the GDPR icon to the Privacy model
* Obfuscate Admob AFMA Container

# Wed Jun 13 05:22:38 UTC 2018

* Fix Vpaid loading issue in iOS
* ABGroup fix by casting TestEnvironment AbGroup to a number
* Add helper functions to reduce casting complexity with tests

# Tue Jun 12 20:30:09 UTC 2018

* Use isMoatEnabled flag from auction response
* A/B for new endscreen design in groups 16 and 17
* Add GDPR icon to MRAID gdpr banner and GDPR stylesheet cleanup

# Tue Jun 12 07:57:06 UTC 2018

* Refactor AB Groups to be their own class
* Fix for Admob proto getting values set with undefined
* Remove privacy banner/button during XPromo
* Fix GDPR skip event for vast

# Mon Jun 11 21:00:41 UTC 2018

* Remove gamerId from operative events
* Removed the GDPR icon AB test and use the GDPR font icon. Test was running on AB groups 16 & 17

# Fri Jun  8 20:24:13 UTC 2018

* GDPR banners for all ad units

# Thu Jun  7 17:15:45 UTC 2018

* Fix Purchasing utilities diagnostics
* Refactor GDPR event sending to GdprManager

# Wed Jun  6 09:37:02 UTC 2018

* Refactor promo purchasing utilities

# Tue Jun  5 17:49:15 UTC 2018

* Refactor third party event sending url template
* Fix GDPR pop-up banner placement on iPhone X
* Refactor XPROMO operative event manager

# Tue Jun  5 09:09:50 UTC 2018

* Include event source in GDPR optout events
* Refactor GdprConsentManager to GdprManager
* IAP promo Android loading optimization
* Add stored_gamer_id diagnostic event to track stored gamer IDs in config request

# Mon Jun  4 16:02:48 UTC 2018

* Switch GDPR image to a font icon
* Fix videoplayer regressions
* Remove gamer ID from analytics core stats events

# Mon Jun  4 11:15:18 UTC 2018

* Moved GDPR banner on top of the game background image in portrait mode
* Added support for adUnitStyle and ctaButtonColour

# Wed May 30 21:00:10 UTC 2018

* Reuse previous auctionId for no fill retries
* Invalidate cached ad response if request url has changed
* Remove gamerId from auction request

# Wed May 30 11:20:00 UTC 2018

* Remove delay for closing playable MRAID on groups 18 and 19.
* Reject cache promise with CacheStatus.STOPPED when stopped.
* Disable auto batch after init on Android.

# Tue May 29 20:56:59 UTC 2018

* Refactor ad unit lifecycle handling

# Fri May 25 15:33:04 UTC 2018

* Update Unity logo
* Update GDPR icon position on endscreen
* Change battery level scaling from 0..100 to 0..1 in AdMob signals
* Add ConfigurationParser to parse configuration response

# Thu May 24 22:17:19 UTC 2018

* Add Promo GDPR Banner Functionality
* Remove gamerID from GDPR user personal data collecting URL
* Prevent sending multiple CTA click events in vast

# Thu May 24 15:37:24 UTC 2018

* Delete gamerId from local storage and use gamer token in config request for iOS limit ad tracking devices
* Update GDPR flow, privacy icon and dialog
* Fix GDPR sorry message issue
* Fix duplicate GDPR skip event if user reviews privacy policy accessed with info button
* Fix GDPR data deletion display bug

# Wed May 23 16:12:46 UTC 2018

* GDPR popup update to match latest legal and product requirements
* Send GDPR skip event when someone opens GDPR popup but does not change default selection
* Prevent nulls from AdMob signals to native Storage API

# Tue May 22 11:48:50 UTC 2018

* Support string values in GDPR consent metadata

# Mon May 21 21:33:51 UTC 2018

* Remove advertising identifier from MOAT integration for GDPR compliance
* Stop square endscreen image A/B test from groups 5 and 6
* Enable cached campaign response for all users

# Fri May 18 09:26:31 UTC 2018

* Support for GDPR consent metadata
* Add GDPR parameters to operative events

# Thu May 17 10:44:24 UTC 2018

* Send GDPR opt-out messages to production topic

# Wed May 16 21:23:14 UTC 2018

* Set gameId = gameId | gamerToken for IAP promo
* Grab APK download link from the click attribution URL
* Platform specific GDPR privacy text functionality

# Wed May 16 08:39:25 UTC 2018

* iOS AdMob Precache for all groups.
* Uses full screen width and height for Display when not set in the campaign.

# Tue May 15 20:36:34 UTC 2018

* Anonymize non-operational events
* Fix configuration for creative test apps

# Tue May 15 08:39:57 UTC 2018

* Send GDPR opt-out events to test topic

# Mon May 14 20:36:21 UTC 2018

* Initial GDPR support for performance ads
* Update square endscreen image target campaign IDs
* Change IAP promo finish states to skip on close and finished on purchase

# Mon May 14 09:12:28 UTC 2018

* Remove GDPR popup A/B test from groups 18 & 19

# Wed May  9 20:37:15 UTC 2018

* Disable ComScore integration
* Add make watch-fast target

# Wed May  9 08:41:13 UTC 2018

* Adds iOS AdMob video precaching for AB Groups 14 and 15.

# Tue May  8 20:21:44 UTC 2018

* Add organizationId to ad requests
* Split display interstitial content type to programmatic/static-interstitial-html and programmatic/static-interstitial-js
* Drop gameSessionCounters from skip event payload
* Restart backup campaign A/B test on groups 11 and 12

# Fri May  4 13:36:21 UTC 2018

* Stop A/B test from groups 7 and 8 that was accidentally restarted on Apr 26 deployment
* Fix init promise chain

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
