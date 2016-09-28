

### TOC
[All Parameters](#all-parameters)  
[Configuration](#configuration)  
[adPlan Requests](#adplan-requests)  
[Video events](#video-events)  


### All Parameters
| key | type | description | provider | platforms |
|---|---|---|---|---|
| abGroup | Integer | Integer from 0 to 19 | Server | None |
| adapterName | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | None |
| adapterVersion | String | For instance: 1.2.4 | App | None |
| advertisingTrackingId | String | Advertising identifier in raw format | SDK | all |
| androidId | String | Android ID | SDK | android |
| apiLevel | Integer | Android device API level | SDK | android |
| applicationMuted | Boolean | If game has been muted | App | None |
| applicationOrientation | String | Configured/Allowed orientations for the app | SDK | None |
| batteryLevel | Integer | Precentage of battery charging status | SDK | None |
| batteryStatus | String | Charging / Full / Draining etc. | SDK | None |
| bundleId | String | Bundle identifier for the app | SDK | all |
| bundleVersion | String | Game version | SDK | all |
| cached | Boolean | If video is cached or streamed | SDK | None |
| cachingDuration | Integer | Milliseconds taken to cache | SDK | None |
| cachingSize | Integer | Size of the asset cached | SDK | None |
| campaignId | String | Internal campaign identifier | Server | None |
| connectionType | String | "wifi", "cellular" or "none" | SDK | all |
| country | String | 2 character country code | Server | None |
| currentOrientation | String | Current orientation at the time of the event | SDK | None |
| deviceFreeMemory | Integer | Free memory in kilobytes | SDK | None |
| deviceHeadset | Boolean | Boolean if user has headset plugged in | SDK | None |
| deviceMake | String | Android device manufacturer | SDK | android |
| deviceModel | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| deviceRingerMode | String | Silent / Vibrate / Sound () | SDK | None |
| deviceRingerMode | String | Silent / Vibrate / Sound | SDK | None |
| deviceTotalMemory | Integer | Total memory in kilobytes | SDK | None |
| deviceTotalSpace | Integer | Total space in kilobytes | SDK | None |
| deviceVolume | Integer | Device volume | SDK | None |
| encrypted | Boolean | Basically is the application debuggable or not  | SDK | None |
| eventId | String | Unique event identifier | SDK | None |
| eventType | String | Event type | SDK | None |
| frameworkName | String | The framework/game toolkit used to build the game, for example: Unity | App | None |
| frameworkVersion | String | For instance: 5.3.1p3 | App | None |
| freeSpace | Integer | Free space in kilobytes | SDK | all |
| gameId | String | Source game identifier | Admin | None |
| gamerId | String | Internal gamer identifier | Server | all |
| integrationType | string | "AssetStore","Engine","native","mediation" | SDK | None |
| language | String | Device language code (e.g. en_US or fr_CA) | SDK | all |
| limitAdTracking | Boolean | Boolean if user has limited tracking or not | SDK | all |
| mediation | JSONobject | mediation data in JSON object (Will get refactored) | app | all |
| mediationOrdinal | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | None |
| mediationProvider | String | Mediation provider name | Mediation | None |
| mediationVersion | String | Mediation SDK version | Mediation | None |
| muted | Boolean | Is the video muted from the UI | SDK | None |
| networkOperator | Integer | MCC + MNC codes | SDK | all |
| networkOperatorName | Integer | Cell network operator name | SDK | all |
| networkType | String | Detailed cellular network type | SDK | all |
| osVersion | String | Device operating system version | SDK | all |
| placementId | String | Internal placement identifier | Admin | None |
| placementType | String | "rewarded" or "interstitial" | Admin | None |
| platform | String | "android" or "ios" | SDK | all |
| retryCount | Integer | How many times this event_id has been retried | SDK | None |
| rooted | Boolean | Was the device rooted/jailbroken or not according to check | SDK | None |
| screenBrightness | Integer | Brightness value | SDK | None |
| screenDensity | Integer | Screen density in DPI | SDK | android |
| screenHeight | Integer | Screen height in pixels | SDK | all |
| screenSize | Integer | Android raw screen layout value | SDK | android |
| screenWidth | Integer | Screen width in pixels | SDK | all |
| sdkVersion | String | SDK version in four digits | SDK | all |
| sessionId | String | Unique session identifier | SDK | None |
| sid | String | Server side reward callback id | App | None |
| skippableAt | Integer | Milliseconds when user can skip | Admin | None |
| skippedAt | Integer | Milliseconds from video start when it was skipped | SDK | None |
| test | Boolean | Test mode | App | all |
| timestamp | Integer | Local time of triggering the event | SDK | None |
| timeZone | String | Current timezone | SDK | all |
| trackingEnabled | Boolean | Boolean if user has limited tracking or not | SDK | None |
| userAgent | String | WebView user agent | SDK | None |
| videoLength | Integer | Video length in milliseconds | Admin | None |
| webviewUa | String | WebView user agent string | SDK | all |
| webviewVersion | String | WebView version | SDK | None |



### Configuration
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| abGroup | None | None | None | Integer | Integer from 0 to 19 | Server | None |
| adapterName | None | None | None | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | None |
| adapterVersion | None | None | None | String | For instance: 1.2.4 | App | None |
| advertisingTrackingId | None | None | None | String | Advertising identifier in raw format | SDK | all |
| apiLevel | None | None | None | Integer | Android device API level | SDK | android |
| applicationMuted | None | None | None | Boolean | If game has been muted | App | None |
| applicationOrientation | None | None | None | String | Configured/Allowed orientations for the app | SDK | None |
| batteryLevel | None | None | None | Integer | Precentage of battery charging status | SDK | None |
| batteryStatus | None | None | None | String | Charging / Full / Draining etc. | SDK | None |
| bundleId | None | None | None | String | Bundle identifier for the app | SDK | all |
| bundleVersion | None | None | None | String | Game version | SDK | all |
| cached | None | None | None | Boolean | If video is cached or streamed | SDK | None |
| cachingDuration | None | None | None | Integer | Milliseconds taken to cache | SDK | None |
| cachingSize | None | None | None | Integer | Size of the asset cached | SDK | None |
| campaignId | None | None | None | String | Internal campaign identifier | Server | None |
| connectionType | None | None | None | String | "wifi", "cellular" or "none" | SDK | all |
| country | None | None | None | String | 2 character country code | Server | None |
| currentOrientation | None | None | None | String | Current orientation at the time of the event | SDK | None |
| deviceFreeMemory | None | None | None | Integer | Free memory in kilobytes | SDK | None |
| freeSpace | None | None | None | Integer | Free space in kilobytes | SDK | all |
| deviceHeadset | None | None | None | Boolean | Boolean if user has headset plugged in | SDK | None |
| deviceMake | None | None | None | String | Android device manufacturer | SDK | android |
| deviceModel | None | None | None | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| deviceRingerMode | None | None | None | String | Silent / Vibrate / Sound () | SDK | None |
| deviceTotalMemory | None | None | None | Integer | Total memory in kilobytes | SDK | None |
| deviceTotalSpace | None | None | None | Integer | Total space in kilobytes | SDK | None |
| deviceVolume | None | None | None | Integer | Device volume | SDK | None |
| encrypted | None | None | None | Boolean | Basically is the application debuggable or not  | SDK | None |
| eventId | None | None | None | String | Unique event identifier | SDK | None |
| frameworkName | None | None | None | String | The framework/game toolkit used to build the game, for example: Unity | App | None |
| frameworkVersion | None | None | None | String | For instance: 5.3.1p3 | App | None |
| gameId | None | None | None | String | Source game identifier | Admin | None |
| gamerId | None | None | None | String | Internal gamer identifier | Server | all |
| language | None | None | None | String | Device language code (e.g. en_US or fr_CA) | SDK | all |
| mediationOrdinal | None | None | None | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | None |
| mediationProvider | None | None | None | String | Mediation provider name | Mediation | None |
| mediationVersion | None | None | None | String | Mediation SDK version | Mediation | None |
| muted | None | None | None | Boolean | Is the video muted from the UI | SDK | None |
| networkOperator | None | None | None | Integer | MCC + MNC codes | SDK | all |
| networkOperatorName | None | None | None | Integer | Cell network operator name | SDK | all |
| networkType | None | None | None | String | Detailed cellular network type | SDK | all |
| osVersion | None | None | None | String | Device operating system version | SDK | all |
| placementId | None | None | None | String | Internal placement identifier | Admin | None |
| placementType | None | None | None | String | "rewarded" or "interstitial" | Admin | None |
| platform | None | None | None | String | "android" or "ios" | SDK | all |
| retryCount | None | None | None | Integer | How many times this event_id has been retried | SDK | None |
| rooted | None | None | None | Boolean | Was the device rooted/jailbroken or not according to check | SDK | None |
| screenBrightness | None | None | None | Integer | Brightness value | SDK | None |
| screenDensity | None | None | None | Integer | Screen density in DPI | SDK | android |
| screenHeight | None | None | None | Integer | Screen height in pixels | SDK | all |
| screenSize | None | None | None | Integer | Android raw screen layout value | SDK | android |
| screenWidth | None | None | None | Integer | Screen width in pixels | SDK | all |
| sdkVersion | None | None | None | String | SDK version in four digits | SDK | all |
| sessionId | None | None | None | String | Unique session identifier | SDK | None |
| sid | None | None | None | String | Server side reward callback id | App | None |
| skippableAt | None | None | None | Integer | Milliseconds when user can skip | Admin | None |
| skippedAt | None | None | None | Integer | Milliseconds from video start when it was skipped | SDK | None |
| test | None | None | None | Boolean | Test mode | App | all |
| timestamp | None | None | None | Integer | Local time of triggering the event | SDK | None |
| timeZone | None | None | None | String | Current timezone | SDK | all |
| trackingEnabled | None | None | None | Boolean | Boolean if user has limited tracking or not | SDK | None |
| userAgent | None | None | None | String | WebView user agent | SDK | None |
| videoLength | None | None | None | Integer | Video length in milliseconds | Admin | None |
| webviewVersion | None | None | None | String | WebView version | SDK | None |
| integrationType | None | None | None | string | "AssetStore","Engine","native","mediation" | SDK | None |



### adPlan Requests
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| advertisingTrackingId | no | True | False | String | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | True | False | Boolean | Boolean if user has limited tracking or not | SDK | all |
| androidId | no | True | False | String | Android ID | SDK | android |
| deviceMake | android | True | False | String | Android device manufacturer | SDK | android |
| deviceModel | all | True | False | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| platform | all | True | False | String | "android" or "ios" | SDK | all |
| screenDensity | android | True | False | Integer | Screen density in DPI | SDK | android |
| screenWidth | all | True | False | Integer | Screen width in pixels | SDK | all |
| screenHeight | all | True | False | Integer | Screen height in pixels | SDK | all |
| sdkVersion | all | True | False | String | SDK version in four digits | SDK | all |
| screenSize | android | True | False | Integer | Android raw screen layout value | SDK | android |
| osVersion | ios | True | False | String | Device operating system version | SDK | all |
| apiLevel | android | True | False | Integer | Android device API level | SDK | android |
| test | no | True | False | Boolean | Test mode | App | all |
| connectionType | all | True | False | String | "wifi", "cellular" or "none" | SDK | all |
| networkType | no | True | False | String | Detailed cellular network type | SDK | all |
| gamerId | no | True | False | String | Internal gamer identifier | Server | all |
| bundleVersion | all | False | True | String | Game version | SDK | all |
| bundleId | all | False | True | String | Bundle identifier for the app | SDK | all |
| language | all | False | True | String | Device language code (e.g. en_US or fr_CA) | SDK | all |
| timeZone | all | False | True | String | Current timezone | SDK | all |
| webviewUa | no | False | True | String | WebView user agent string | SDK | all |
| freeSpace | all | False | True | Integer | Free space in kilobytes | SDK | all |
| networkOperator | no | False | True | Integer | MCC + MNC codes | SDK | all |
| networkOperatorName | no | False | True | Integer | Cell network operator name | SDK | all |
| mediation | no | False | True | JSONobject | mediation data in JSON object (Will get refactored) | app | all |



### Video events
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| abGroup | None | None | None | Integer | Integer from 0 to 19 | Server | None |
| adapterName | None | None | None | String | If there was an adapter between the framework and SDK native code, for instance: UnityAds AssetStore Plugin or UnityAds Engine Integration | App | None |
| adapterVersion | None | None | None | String | For instance: 1.2.4 | App | None |
| advertisingTrackingId | None | None | None | String | Advertising identifier in raw format | SDK | all |
| apiLevel | None | None | None | Integer | Android device API level | SDK | android |
| androidId | None | None | None | String | Android ID | SDK | android |
| applicationMuted | None | None | None | Boolean | If game has been muted | App | None |
| applicationOrientation | None | None | None | String | Configured/Allowed orientations for the app | SDK | None |
| batteryLevel | None | None | None | Integer | Precentage of battery charging status | SDK | None |
| batteryStatus | None | None | None | String | Charging / Full / Draining etc. | SDK | None |
| bundleId | None | None | None | String | Bundle identifier for the app | SDK | all |
| bundleVersion | None | None | None | String | Game version | SDK | all |
| cached | None | None | None | Boolean | If video is cached or streamed | SDK | None |
| cachingDuration | None | None | None | Integer | Milliseconds taken to cache | SDK | None |
| cachingSize | None | None | None | Integer | Size of the asset cached | SDK | None |
| campaignId | None | None | None | String | Internal campaign identifier | Server | None |
| connectionType | None | None | None | String | "wifi", "cellular" or "none" | SDK | all |
| country | None | None | None | String | 2 character country code | Server | None |
| currentOrientation | None | None | None | String | Current orientation at the time of the event | SDK | None |
| deviceFreeMemory | None | None | None | Integer | Free memory in kilobytes | SDK | None |
| freeSpace | None | None | None | Integer | Free space in kilobytes | SDK | all |
| deviceHeadset | None | None | None | Boolean | Boolean if user has headset plugged in | SDK | None |
| deviceMake | None | None | None | String | Android device manufacturer | SDK | android |
| deviceModel | None | None | None | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| deviceRingerMode | None | None | None | String | Silent / Vibrate / Sound () | SDK | None |
| deviceTotalMemory | None | None | None | Integer | Total memory in kilobytes | SDK | None |
| deviceTotalSpace | None | None | None | Integer | Total space in kilobytes | SDK | None |
| deviceVolume | None | None | None | Integer | Device volume | SDK | None |
| encrypted | None | None | None | Boolean | Basically is the application debuggable or not  | SDK | None |
| eventId | None | None | None | String | Unique event identifier | SDK | None |
| eventType | None | None | None | String | Event type | SDK | None |
| frameworkName | None | None | None | String | The framework/game toolkit used to build the game, for example: Unity | App | None |
| frameworkVersion | None | None | None | String | For instance: 5.3.1p3 | App | None |
| gameId | None | None | None | String | Source game identifier | Admin | None |
| gamerId | None | None | None | String | Internal gamer identifier | Server | all |
| language | None | None | None | String | Device language code (e.g. en_US or fr_CA) | SDK | all |
| mediationOrdinal | None | None | None | Integer | Order of ad shown in mediation waterfall? IIRC | Mediation | None |
| mediationProvider | None | None | None | String | Mediation provider name | Mediation | None |
| mediationVersion | None | None | None | String | Mediation SDK version | Mediation | None |
| muted | None | None | None | Boolean | Is the video muted from the UI | SDK | None |
| networkOperator | None | None | None | Integer | MCC + MNC codes | SDK | all |
| networkOperatorName | None | None | None | Integer | Cell network operator name | SDK | all |
| networkType | None | None | None | String | Detailed cellular network type | SDK | all |
| osVersion | None | None | None | String | Device operating system version | SDK | all |
| placementId | None | None | None | String | Internal placement identifier | Admin | None |
| placementType | None | None | None | String | "rewarded" or "interstitial" | Admin | None |
| platform | None | None | None | String | "android" or "ios" | SDK | all |
| retryCount | None | None | None | Integer | How many times this event_id has been retried | SDK | None |
| rooted | None | None | None | Boolean | Was the device rooted/jailbroken or not according to check | SDK | None |
| screenBrightness | None | None | None | Integer | Brightness value | SDK | None |
| screenDensity | None | None | None | Integer | Screen density in DPI | SDK | android |
| screenHeight | None | None | None | Integer | Screen height in pixels | SDK | all |
| screenSize | None | None | None | Integer | Android raw screen layout value | SDK | android |
| screenWidth | None | None | None | Integer | Screen width in pixels | SDK | all |
| sdkVersion | None | None | None | String | SDK version in four digits | SDK | all |
| sessionId | None | None | None | String | Unique session identifier | SDK | None |
| sid | None | None | None | String | Server side reward callback id | App | None |
| skippableAt | None | None | None | Integer | Milliseconds when user can skip | Admin | None |
| skippedAt | None | None | None | Integer | Milliseconds from video start when it was skipped | SDK | None |
| test | None | None | None | Boolean | Test mode | App | all |
| timestamp | None | None | None | Integer | Local time of triggering the event | SDK | None |
| timeZone | None | None | None | String | Current timezone | SDK | all |
| limitAdTracking | None | None | None | Boolean | Boolean if user has limited tracking or not | SDK | all |
| userAgent | None | None | None | String | WebView user agent | SDK | None |
| videoLength | None | None | None | Integer | Video length in milliseconds | Admin | None |
| webviewVersion | None | None | None | String | WebView version | SDK | None |
| integrationType | None | None | None | string | "AssetStore","Engine","native","mediation" | SDK | None |

