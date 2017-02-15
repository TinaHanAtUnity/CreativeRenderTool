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

*

## 2.0.7

*


## 2.0.6

*

## 2.0.5

*

## 2.0.4

*

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
