

### All Parameters
| key | type | description | provider | platforms |
|---|---|---|---|---|
| abGroup | Integer | Integer from 0 to 19 | Server | NA |
| adapterName | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | NA |
| adapterVersion | String | For instance: 1.2.4 | App | NA |
| advertisingId | String | Advertising identifier in raw format | SDK | NA |
| androidId | NA | NA | NA | NA |
| apiLevel | Integer | Android device API level | SDK | NA |
| applicationMuted | Boolean | If game has been muted | App | NA |
| applicationOrientation | String | Configured/Allowed orientations for the app | SDK | NA |
| batteryLevel | Integer | Precentage of battery charging status | SDK | NA |
| batteryStatus | String | Charging / Full / Draining etc. | SDK | NA |
| bundleId | String | Bundle identifier for the app | SDK | NA |
| bundleVersion | String | Game version | SDK | NA |
| cached | Boolean | If video is cached or streamed | SDK | NA |
| cachingDuration | Integer | Milliseconds taken to cache | SDK | NA |
| cachingSize | Integer | Size of the asset cached | SDK | NA |
| campaignId | String | Internal campaign identifier | Server | NA |
| connectionType | String | "wifi", "cellular" or "none" | SDK | NA |
| country | String | 2 character country code | Server | NA |
| currentOrientation | String | Current orientation at the time of the event | SDK | NA |
| deviceFreeMemory | Integer | Free memory in kilobytes | SDK | NA |
| deviceFreeSpace | Integer | Free space in kilobytes | SDK | NA |
| deviceHeadset | Boolean | Boolean if user has headset plugged in | SDK | NA |
| deviceMake | String | Android device manufacturer | SDK | NA |
| deviceModel | String | Android device model | SDK | NA |
| deviceRingerMode | String | Silent / Vibrate / Sound () | SDK | NA |
| deviceRingerMode | String | Silent / Vibrate / Sound | SDK | NA |
| deviceTotalMemory | Integer | Total memory in kilobytes | SDK | NA |
| deviceTotalSpace | Integer | Total space in kilobytes | SDK | NA |
| deviceType | String | iOS raw device type | SDK | NA |
| deviceVolume | Integer | Device volume | SDK | NA |
| encrypted | Boolean | Basically is the application debuggable or not  | SDK | NA |
| eventId | String | Unique event identifier | SDK | NA |
| eventType | String | Event type | SDK | NA |
| frameworkName | String | The framework/game toolkit used to build the game, for example: Unity | App | NA |
| frameworkVersion | String | For instance: 5.3.1p3 | App | NA |
| gameId | String | Source game identifier | Admin | NA |
| gamerId | String | Internal gamer identifier | Server | NA |
| integrationType | string | "AssetStore","Engine","native","mediation" | SDK | NA |
| language | String | Device language code (e.g. en_US or fr_CA) | SDK | NA |
| limitAdTracking | Boolean | Boolean if user has limited tracking or not | SDK | NA |
| mediationOrdinal | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | NA |
| mediationProvider | String | Mediation provider name | Mediation | NA |
| mediationVersion | String | Mediation SDK version | Mediation | NA |
| muted | Boolean | Is the video muted from the UI | SDK | NA |
| networkOperator | Integer | MCC + MNC codes | SDK | NA |
| networkOperatorName | Integer | Cell network operator name | SDK | NA |
| networkType | String | Detailed cellular network type | SDK | NA |
| osVersion | String | Device operating system version | SDK | NA |
| placementId | String | Internal placement identifier | Admin | NA |
| placementType | String | "rewarded" or "interstitial" | Admin | NA |
| platform | String | "android" or "ios" | SDK | NA |
| retryCount | Integer | How many times this event_id has been retried | SDK | NA |
| rooted | Boolean | Was the device rooted/jailbroken or not according to check | SDK | NA |
| screenBrightness | Integer | Brightness value | SDK | NA |
| screenDensity | Integer | In DPI | SDK | NA |
| screenHeight | Integer | Screen height in pixels | SDK | NA |
| screenLayout | Integer | Android raw screen layout value | SDK | NA |
| screenWidth | Integer | Screen width in pixels | SDK | NA |
| sdkVersion | String | SDK version | SDK | NA |
| sessionId | String | Unique session identifier | SDK | NA |
| sid | String | Server side reward callback id | App | NA |
| skippableAt | Integer | Milliseconds when user can skip | Admin | NA |
| skippedAt | Integer | Milliseconds from video start when it was skipped | SDK | NA |
| testMode | Boolean | Test mode | App | NA |
| timestamp | Integer | Local time of triggering the event | SDK | NA |
| timezone | String | How many hours is the local time offset from UTC. For instance PST would be "-8:00", India would be "+5:30"  | SDK | NA |
| trackingEnabled | Boolean | Boolean if user has limited tracking or not | SDK | NA |
| userAgent | String | WebView user agent | SDK | NA |
| videoLength | Integer | Video length in milliseconds | Admin | NA |
| webviewVersion | String | WebView version | SDK | NA |



### Configuration
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| abGroup | NA | NA | NA | Integer | Integer from 0 to 19 | Server | NA |
| adapterName | NA | NA | NA | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | NA |
| adapterVersion | NA | NA | NA | String | For instance: 1.2.4 | App | NA |
| advertisingId | NA | NA | NA | String | Advertising identifier in raw format | SDK | NA |
| apiLevel | NA | NA | NA | Integer | Android device API level | SDK | NA |
| applicationMuted | NA | NA | NA | Boolean | If game has been muted | App | NA |
| applicationOrientation | NA | NA | NA | String | Configured/Allowed orientations for the app | SDK | NA |
| batteryLevel | NA | NA | NA | Integer | Precentage of battery charging status | SDK | NA |
| batteryStatus | NA | NA | NA | String | Charging / Full / Draining etc. | SDK | NA |
| bundleId | NA | NA | NA | String | Bundle identifier for the app | SDK | NA |
| bundleVersion | NA | NA | NA | String | Game version | SDK | NA |
| cached | NA | NA | NA | Boolean | If video is cached or streamed | SDK | NA |
| cachingDuration | NA | NA | NA | Integer | Milliseconds taken to cache | SDK | NA |
| cachingSize | NA | NA | NA | Integer | Size of the asset cached | SDK | NA |
| campaignId | NA | NA | NA | String | Internal campaign identifier | Server | NA |
| connectionType | NA | NA | NA | String | "wifi", "cellular" or "none" | SDK | NA |
| country | NA | NA | NA | String | 2 character country code | Server | NA |
| currentOrientation | NA | NA | NA | String | Current orientation at the time of the event | SDK | NA |
| deviceFreeMemory | NA | NA | NA | Integer | Free memory in kilobytes | SDK | NA |
| deviceFreeSpace | NA | NA | NA | Integer | Free space in kilobytes | SDK | NA |
| deviceHeadset | NA | NA | NA | Boolean | Boolean if user has headset plugged in | SDK | NA |
| deviceMake | NA | NA | NA | String | Android device manufacturer | SDK | NA |
| deviceModel | NA | NA | NA | String | Android device model | SDK | NA |
| deviceRingerMode | NA | NA | NA | String | Silent / Vibrate / Sound () | SDK | NA |
| deviceTotalMemory | NA | NA | NA | Integer | Total memory in kilobytes | SDK | NA |
| deviceTotalSpace | NA | NA | NA | Integer | Total space in kilobytes | SDK | NA |
| deviceType | NA | NA | NA | String | iOS raw device type | SDK | NA |
| deviceVolume | NA | NA | NA | Integer | Device volume | SDK | NA |
| encrypted | NA | NA | NA | Boolean | Basically is the application debuggable or not  | SDK | NA |
| eventId | NA | NA | NA | String | Unique event identifier | SDK | NA |
| frameworkName | NA | NA | NA | String | The framework/game toolkit used to build the game, for example: Unity | App | NA |
| frameworkVersion | NA | NA | NA | String | For instance: 5.3.1p3 | App | NA |
| gameId | NA | NA | NA | String | Source game identifier | Admin | NA |
| gamerId | NA | NA | NA | String | Internal gamer identifier | Server | NA |
| language | NA | NA | NA | String | Device language code (e.g. en_US or fr_CA) | SDK | NA |
| mediationOrdinal | NA | NA | NA | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | NA |
| mediationProvider | NA | NA | NA | String | Mediation provider name | Mediation | NA |
| mediationVersion | NA | NA | NA | String | Mediation SDK version | Mediation | NA |
| muted | NA | NA | NA | Boolean | Is the video muted from the UI | SDK | NA |
| networkOperator | NA | NA | NA | Integer | MCC + MNC codes | SDK | NA |
| networkOperatorName | NA | NA | NA | Integer | Cell network operator name | SDK | NA |
| networkType | NA | NA | NA | String | Detailed cellular network type | SDK | NA |
| osVersion | NA | NA | NA | String | Device operating system version | SDK | NA |
| placementId | NA | NA | NA | String | Internal placement identifier | Admin | NA |
| placementType | NA | NA | NA | String | "rewarded" or "interstitial" | Admin | NA |
| platform | NA | NA | NA | String | "android" or "ios" | SDK | NA |
| retryCount | NA | NA | NA | Integer | How many times this event_id has been retried | SDK | NA |
| rooted | NA | NA | NA | Boolean | Was the device rooted/jailbroken or not according to check | SDK | NA |
| screenBrightness | NA | NA | NA | Integer | Brightness value | SDK | NA |
| screenDensity | NA | NA | NA | Integer | In DPI | SDK | NA |
| screenHeight | NA | NA | NA | Integer | Screen height in pixels | SDK | NA |
| screenLayout | NA | NA | NA | Integer | Android raw screen layout value | SDK | NA |
| screenWidth | NA | NA | NA | Integer | Screen width in pixels | SDK | NA |
| sdkVersion | NA | NA | NA | String | SDK version | SDK | NA |
| sessionId | NA | NA | NA | String | Unique session identifier | SDK | NA |
| sid | NA | NA | NA | String | Server side reward callback id | App | NA |
| skippableAt | NA | NA | NA | Integer | Milliseconds when user can skip | Admin | NA |
| skippedAt | NA | NA | NA | Integer | Milliseconds from video start when it was skipped | SDK | NA |
| testMode | NA | NA | NA | Boolean | Test mode | App | NA |
| timestamp | NA | NA | NA | Integer | Local time of triggering the event | SDK | NA |
| timezone | NA | NA | NA | String | How many hours is the local time offset from UTC. For instance PST would be "-8:00", India would be "+5:30"  | SDK | NA |
| trackingEnabled | NA | NA | NA | Boolean | Boolean if user has limited tracking or not | SDK | NA |
| userAgent | NA | NA | NA | String | WebView user agent | SDK | NA |
| videoLength | NA | NA | NA | Integer | Video length in milliseconds | Admin | NA |
| webviewVersion | NA | NA | NA | String | WebView version | SDK | NA |
| integrationType | NA | NA | NA | string | "AssetStore","Engine","native","mediation" | SDK | NA |



### adPlan Requests
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| abGroup | NA | NA | NA | Integer | Integer from 0 to 19 | Server | NA |
| adapterName | NA | NA | NA | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | NA |
| adapterVersion | NA | NA | NA | String | For instance: 1.2.4 | App | NA |
| advertisingId | NA | NA | NA | String | Advertising identifier in raw format | SDK | NA |
| apiLevel | NA | NA | NA | Integer | Android device API level | SDK | NA |
| applicationMuted | NA | NA | NA | Boolean | If game has been muted | App | NA |
| applicationOrientation | NA | NA | NA | String | Configured/Allowed orientations for the app | SDK | NA |
| batteryLevel | NA | NA | NA | Integer | Precentage of battery charging status | SDK | NA |
| batteryStatus | NA | NA | NA | String | Charging / Full / Draining etc. | SDK | NA |
| bundleId | NA | NA | NA | String | Bundle identifier for the app | SDK | NA |
| bundleVersion | NA | NA | NA | String | Game version | SDK | NA |
| cached | NA | NA | NA | Boolean | If video is cached or streamed | SDK | NA |
| cachingDuration | NA | NA | NA | Integer | Milliseconds taken to cache | SDK | NA |
| cachingSize | NA | NA | NA | Integer | Size of the asset cached | SDK | NA |
| campaignId | NA | NA | NA | String | Internal campaign identifier | Server | NA |
| connectionType | NA | NA | NA | String | "wifi", "cellular" or "none" | SDK | NA |
| country | NA | NA | NA | String | 2 character country code | Server | NA |
| currentOrientation | NA | NA | NA | String | Current orientation at the time of the event | SDK | NA |
| deviceFreeMemory | NA | NA | NA | Integer | Free memory in kilobytes | SDK | NA |
| deviceFreeSpace | NA | NA | NA | Integer | Free space in kilobytes | SDK | NA |
| deviceHeadset | NA | NA | NA | Boolean | Boolean if user has headset plugged in | SDK | NA |
| deviceMake | NA | NA | NA | String | Android device manufacturer | SDK | NA |
| deviceModel | NA | NA | NA | String | Android device model | SDK | NA |
| deviceRingerMode | NA | NA | NA | String | Silent / Vibrate / Sound () | SDK | NA |
| deviceTotalMemory | NA | NA | NA | Integer | Total memory in kilobytes | SDK | NA |
| deviceTotalSpace | NA | NA | NA | Integer | Total space in kilobytes | SDK | NA |
| deviceType | NA | NA | NA | String | iOS raw device type | SDK | NA |
| deviceVolume | NA | NA | NA | Integer | Device volume | SDK | NA |
| encrypted | NA | NA | NA | Boolean | Basically is the application debuggable or not  | SDK | NA |
| eventId | NA | NA | NA | String | Unique event identifier | SDK | NA |
| frameworkName | NA | NA | NA | String | The framework/game toolkit used to build the game, for example: Unity | App | NA |
| frameworkVersion | NA | NA | NA | String | For instance: 5.3.1p3 | App | NA |
| gameId | NA | NA | NA | String | Source game identifier | Admin | NA |
| gamerId | NA | NA | NA | String | Internal gamer identifier | Server | NA |
| language | NA | NA | NA | String | Device language code (e.g. en_US or fr_CA) | SDK | NA |
| mediationOrdinal | NA | NA | NA | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | NA |
| mediationProvider | NA | NA | NA | String | Mediation provider name | Mediation | NA |
| mediationVersion | NA | NA | NA | String | Mediation SDK version | Mediation | NA |
| muted | NA | NA | NA | Boolean | Is the video muted from the UI | SDK | NA |
| networkOperator | NA | NA | NA | Integer | MCC + MNC codes | SDK | NA |
| networkOperatorName | NA | NA | NA | Integer | Cell network operator name | SDK | NA |
| networkType | NA | NA | NA | String | Detailed cellular network type | SDK | NA |
| osVersion | NA | NA | NA | String | Device operating system version | SDK | NA |
| placementId | NA | NA | NA | String | Internal placement identifier | Admin | NA |
| placementType | NA | NA | NA | String | "rewarded" or "interstitial" | Admin | NA |
| platform | NA | NA | NA | String | "android" or "ios" | SDK | NA |
| retryCount | NA | NA | NA | Integer | How many times this event_id has been retried | SDK | NA |
| rooted | NA | NA | NA | Boolean | Was the device rooted/jailbroken or not according to check | SDK | NA |
| screenBrightness | NA | NA | NA | Integer | Brightness value | SDK | NA |
| screenDensity | NA | NA | NA | Integer | In DPI | SDK | NA |
| screenHeight | NA | NA | NA | Integer | Screen height in pixels | SDK | NA |
| screenLayout | NA | NA | NA | Integer | Android raw screen layout value | SDK | NA |
| screenWidth | NA | NA | NA | Integer | Screen width in pixels | SDK | NA |
| sdkVersion | NA | NA | NA | String | SDK version | SDK | NA |
| sessionId | NA | NA | NA | String | Unique session identifier | SDK | NA |
| sid | NA | NA | NA | String | Server side reward callback id | App | NA |
| skippableAt | NA | NA | NA | Integer | Milliseconds when user can skip | Admin | NA |
| skippedAt | NA | NA | NA | Integer | Milliseconds from video start when it was skipped | SDK | NA |
| testMode | NA | NA | NA | Boolean | Test mode | App | NA |
| timestamp | NA | NA | NA | Integer | Local time of triggering the event | SDK | NA |
| timezone | NA | NA | NA | String | How many hours is the local time offset from UTC. For instance PST would be "-8:00", India would be "+5:30"  | SDK | NA |
| limitAdTracking | NA | NA | NA | Boolean | Boolean if user has limited tracking or not | SDK | NA |
| userAgent | NA | NA | NA | String | WebView user agent | SDK | NA |
| videoLength | NA | NA | NA | Integer | Video length in milliseconds | Admin | NA |
| webviewVersion | NA | NA | NA | String | WebView version | SDK | NA |
| integrationType | NA | NA | NA | string | "AssetStore","Engine","native","mediation" | SDK | NA |



### Video events
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| abGroup | NA | NA | NA | Integer | Integer from 0 to 19 | Server | NA |
| adapterName | NA | NA | NA | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | NA |
| adapterVersion | NA | NA | NA | String | For instance: 1.2.4 | App | NA |
| advertisingId | NA | NA | NA | String | Advertising identifier in raw format | SDK | NA |
| apiLevel | NA | NA | NA | Integer | Android device API level | SDK | NA |
| androidId | NA | NA | NA | NA | NA | NA | NA |
| applicationMuted | NA | NA | NA | Boolean | If game has been muted | App | NA |
| applicationOrientation | NA | NA | NA | String | Configured/Allowed orientations for the app | SDK | NA |
| batteryLevel | NA | NA | NA | Integer | Precentage of battery charging status | SDK | NA |
| batteryStatus | NA | NA | NA | String | Charging / Full / Draining etc. | SDK | NA |
| bundleId | NA | NA | NA | String | Bundle identifier for the app | SDK | NA |
| bundleVersion | NA | NA | NA | String | Game version | SDK | NA |
| cached | NA | NA | NA | Boolean | If video is cached or streamed | SDK | NA |
| cachingDuration | NA | NA | NA | Integer | Milliseconds taken to cache | SDK | NA |
| cachingSize | NA | NA | NA | Integer | Size of the asset cached | SDK | NA |
| campaignId | NA | NA | NA | String | Internal campaign identifier | Server | NA |
| connectionType | NA | NA | NA | String | "wifi", "cellular" or "none" | SDK | NA |
| country | NA | NA | NA | String | 2 character country code | Server | NA |
| currentOrientation | NA | NA | NA | String | Current orientation at the time of the event | SDK | NA |
| deviceFreeMemory | NA | NA | NA | Integer | Free memory in kilobytes | SDK | NA |
| deviceFreeSpace | NA | NA | NA | Integer | Free space in kilobytes | SDK | NA |
| deviceHeadset | NA | NA | NA | Boolean | Boolean if user has headset plugged in | SDK | NA |
| deviceMake | NA | NA | NA | String | Android device manufacturer | SDK | NA |
| deviceModel | NA | NA | NA | String | Android device model | SDK | NA |
| deviceRingerMode | NA | NA | NA | String | Silent / Vibrate / Sound () | SDK | NA |
| deviceTotalMemory | NA | NA | NA | Integer | Total memory in kilobytes | SDK | NA |
| deviceTotalSpace | NA | NA | NA | Integer | Total space in kilobytes | SDK | NA |
| deviceType | NA | NA | NA | String | iOS raw device type | SDK | NA |
| deviceVolume | NA | NA | NA | Integer | Device volume | SDK | NA |
| encrypted | NA | NA | NA | Boolean | Basically is the application debuggable or not  | SDK | NA |
| eventId | NA | NA | NA | String | Unique event identifier | SDK | NA |
| eventType | NA | NA | NA | String | Event type | SDK | NA |
| frameworkName | NA | NA | NA | String | The framework/game toolkit used to build the game, for example: Unity | App | NA |
| frameworkVersion | NA | NA | NA | String | For instance: 5.3.1p3 | App | NA |
| gameId | NA | NA | NA | String | Source game identifier | Admin | NA |
| gamerId | NA | NA | NA | String | Internal gamer identifier | Server | NA |
| language | NA | NA | NA | String | Device language code (e.g. en_US or fr_CA) | SDK | NA |
| mediationOrdinal | NA | NA | NA | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | NA |
| mediationProvider | NA | NA | NA | String | Mediation provider name | Mediation | NA |
| mediationVersion | NA | NA | NA | String | Mediation SDK version | Mediation | NA |
| muted | NA | NA | NA | Boolean | Is the video muted from the UI | SDK | NA |
| networkOperator | NA | NA | NA | Integer | MCC + MNC codes | SDK | NA |
| networkOperatorName | NA | NA | NA | Integer | Cell network operator name | SDK | NA |
| networkType | NA | NA | NA | String | Detailed cellular network type | SDK | NA |
| osVersion | NA | NA | NA | String | Device operating system version | SDK | NA |
| placementId | NA | NA | NA | String | Internal placement identifier | Admin | NA |
| placementType | NA | NA | NA | String | "rewarded" or "interstitial" | Admin | NA |
| platform | NA | NA | NA | String | "android" or "ios" | SDK | NA |
| retryCount | NA | NA | NA | Integer | How many times this event_id has been retried | SDK | NA |
| rooted | NA | NA | NA | Boolean | Was the device rooted/jailbroken or not according to check | SDK | NA |
| screenBrightness | NA | NA | NA | Integer | Brightness value | SDK | NA |
| screenDensity | NA | NA | NA | Integer | In DPI | SDK | NA |
| screenHeight | NA | NA | NA | Integer | Screen height in pixels | SDK | NA |
| screenLayout | NA | NA | NA | Integer | Android raw screen layout value | SDK | NA |
| screenWidth | NA | NA | NA | Integer | Screen width in pixels | SDK | NA |
| sdkVersion | NA | NA | NA | String | SDK version | SDK | NA |
| sessionId | NA | NA | NA | String | Unique session identifier | SDK | NA |
| sid | NA | NA | NA | String | Server side reward callback id | App | NA |
| skippableAt | NA | NA | NA | Integer | Milliseconds when user can skip | Admin | NA |
| skippedAt | NA | NA | NA | Integer | Milliseconds from video start when it was skipped | SDK | NA |
| testMode | NA | NA | NA | Boolean | Test mode | App | NA |
| timestamp | NA | NA | NA | Integer | Local time of triggering the event | SDK | NA |
| timezone | NA | NA | NA | String | How many hours is the local time offset from UTC. For instance PST would be "-8:00", India would be "+5:30"  | SDK | NA |
| limitAdTracking | NA | NA | NA | Boolean | Boolean if user has limited tracking or not | SDK | NA |
| userAgent | NA | NA | NA | String | WebView user agent | SDK | NA |
| videoLength | NA | NA | NA | Integer | Video length in milliseconds | Admin | NA |
| webviewVersion | NA | NA | NA | String | WebView version | SDK | NA |
| integrationType | NA | NA | NA | string | "AssetStore","Engine","native","mediation" | SDK | NA |

