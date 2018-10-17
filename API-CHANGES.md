# Native-Webview API Changes and Bugs

This document describes changes in API that native Android and iOS SDKs provide
to webview. This document is intended for reference to webview developers who
deploy master to release branches. Master branch should always be updated to
match with the latest native master branches. Master branch should never have
conditional statements that check native SDK version. All logic for older
native versions will be kept in release branches.

This document also includes some important bugs that are relevant for webview
maintenance. However this document does not and will not try to be an
exhaustive list of all SDK bugs. Rather it will attempt to list the workarounds
we currently need to use for some native releases.

All API methods are referred with class.method notation, e.g. VideoPlayer.play

## 3.0.0

* Added MonetizationListener API class.
* Added CustomPurchasing API class.
* Added Analytics API class.
* Added Permissions API class.

## 2.2.0

* Added home indicator hidden parameter to iOS AdUnit.open method
* Added Android AdUnit methods: startMotionEventCapture, endMotionEventCapture, clearMotionEventCapture, getMotionEventCount, getMotionEventData and getCurrentMotionEventCount
* Added append parameter to Android and iOS Cache.download method
* Added Android Cache methods: getCacheDirectoryType, getCacheDirectoryExists and recreateCacheDirectory
* Added iOS DeviceInfo methods: getTimeZoneOffset, getProcessInfo and getCPUCount
* Added Android DeviceInfo methods: getTimeZoneOffset, isAdbEnabled, getApkDigest, getCertificateFingerprint, getFingerprint, getProcessInfo, isUSBConnected, getCPUCount, getUptime, getElapsedRealtime, getBuildId and getBuildVersionIncremental
* Added Android Intent methods: canOpenIntent, canOpenIntents and checkIntentResolvable
* Removed Android Listener.sendInitiatePurchaseEvent
* Added Android and iOS Preferences API
* Added Android and iOS Purchasing API
* Added Android and iOS SensorInfo API
* Added Android and iOS WebPlayer API

## 2.1.2

* Added Android system UI event handling to ad unit and activity
* Added Cache.setFileContent method to Android and iOS
* Android Cache.getFileContent no longer allows blank string as value for encoding, iOS already functioned this way

## 2.1.1

* Added rotation, width and height to Android show options object sent to webview
* Added statusBarHidden to iOS show options object sent to webview
* Added transparency parameter to Android and iOS AdUnit.open method
* Added animation parameter to iOS AdUnit.open method
* Added Android DeviceInfo.getPackageInfo method
* Added DeviceInfo.getMaxVolume, DeviceInfo.registerVolumeChangeListener and DeviceInfo.unregisterVolumeChangeListener methods
* Added DeviceInfo.VOLUME_CHANGED events
* Fixed Android DeviceInfo.getDeviceVolume to report proper errors
* Fixed Storage API events

## 2.1.0

* Added WKWebView based bridge for new iOS versions
* Raised minimum supported Android version to 4.1 (API level 16)
* Fixed HLS support on iOS
* Added Android LifeCycle API
* Added init timestamp and reinitialized flag to Sdk.loadComplete call in init
* Added Cache.getFileContent method to Android and iOS
* Added Android Cache.getMetaData and iOS Cache.getVideoInfo methods
* Added Android DeviceInfo methods: getSensorList, getBoard, getBootloader, getDevice, getHardware, getHost, getProduct and getSupportedAbis
* Added iOS DeviceInfo method: getSensorList
* Added header parameter to Cache.download method
* Added sendPlacementStateChangedEvent to Android and iOS
* Added IAP metadata instrumentation to Android and iOS
* Modified VideoPlayer events: all events have now video url as first parameter (except PROGRESS)
* Modified iOS AdUnit API: remove VIEW_CONTROLLER prefix from callback error messages
* Modified iOS AdUnit API: remove TARGET_VIEW_NULL error, use only UNKNOWN_VIEW
* Modified Android and iOS AdUnit API: use ADUNIT_NULL error instead of VIEWCONTROLLER_NULL or ACTIVITY_NULL
* Fixed iOS Cache.getFilePath to return FILE_NOT_FOUND error
* Fixed iOS Cache.deleteFile to return FILE_IO_ERROR if file could not be deleted and removed booleans from callback parameters
* Fixed iOS Listener API, removed sending errors to webview if listener was null or didn’t respond to selector
* Fixed iOS Request API: added MAPPING_HEADERS_FAILED error
* Fixed iOS Request API: added response fail event if parsing headers to webview format fails
* Fixed iOS DeviceInfo getNetworkOperator and getNetworkOperatorName methods to return an empty string when there is no SIM card present
* Modified iOS Resolve API: make implementation similar to Android and send INVALID_HOST instead of UNEXPECTED_EXCEPTION
* Modified Android VideoPlayer API, remove useless ’17’ from API_LEVEL_ERROR
* Modified iOS Cache API events by adding request url to all errors
* Modified iOS Cache.getFiles response to match Android
* Added iOS Cache API events: NO_INTERNET, FILE_IO_ERROR, MALFORMED_URL and NETWORK_ERROR
* Added Android Cache API events: NETWORK_ERROR and ILLEGAL_STATE
* Modified Cache API on both platforms to add existing file size to expected content size (not just totalBytes from request)
* Added Android Request API exception type to RESULT_FAIL message


## 2.0.8

* Added iOS Notification.addAVNotificationObserver and Notification.removeAVNotificationObserver
* Added iOS VideoPlayer.setAutomaticallyWaitsToMinimizeStalling
* Added iOS DeviceInfo.getStatusBarWidth, DeviceInfo.getStatusBarHeight and DeviceInfo.isStatusBarHidden
* Fixed iOS config.json fetching: 2.0.6 and 2.0.7 fetched config.json from master directory

## 2.0.7

* Enabled webview flags for iOS HTML5 video playback

## 2.0.6

* Added Android and iOS AdUnit.setViewFrame and AdUnit.getViewFrame methods
* Added iOS AdUnit.setTransform and AdUnit.getTransform but setTransform method was broken
* Added supportedOrientationsPlist and statusBarOrientation parameters when invoking show on iOS
* Added iOS DeviceInfo.getSupportedOrientations and DeviceInfo.getSupportedOrientationsPlist methods
* Added Listener.sendClickEvent method
* Added timeout parameter to VideoPlayer.prepare method and PREPARE_TIMEOUT event

## 2.0.5

* Fix iOS DeviceInfo.getNetworkType, DeviceInfo.getNetworkOperator and DeviceInfo.getNetworkOperatorName for iOS 10. In previous releases these methods will fail on iOS 10.

## 2.0.4

* No visible changes

## 2.0.3

* Fixed iOS DeviceInfo.getLimitAdTrackingFlag that previously gave inversed values
* Fixed Request and Cache API to return headers as JSON arrays on both platforms. Previously iOS used JSON objects.
* Fixed iOS Storage API errors to match Android
* Fixed iOS successful Request API event. Previously if response was not valid UTF-8, response was null and the rest of the parameters (like response code) were missing.

## 2.0.2

* Activity IDs added to AdUnit.open and all Android AdUnit lifecycle events
* Previous releases have Android workaround to delay sending ready event until 10 seconds have passed since ad unit closing

## 2.0.0-rc1

* No visible changes

## 2.0.0-beta5

* iOS Storage.getKeys was fixed. Previous versions of iOS Storage.getKeys did not work at all.

## 2.0.0-beta4

* No visible changes

## 2.0.0-beta3

* No visible changes

## 2.0.0-beta2

* First supported version. Previous versions were only in internal use.
