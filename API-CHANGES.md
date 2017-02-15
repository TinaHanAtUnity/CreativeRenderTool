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

## 2.1.0

*


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
