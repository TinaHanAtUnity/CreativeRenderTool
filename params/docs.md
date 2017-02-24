

### TOC
[All Parameters](#all-parameters)  
[Configuration request](#configuration-request)  
[Ad request](#ad-request)  
[Video events](#video-events)  
[Click event](#click-event)  


### All Parameters
| key | type | description | provider | platforms |
|---|---|---|---|---|
| adapterName | String | Unity adapter between game code and SDK, "AssetStore" for Asset Store package and "Engine" for Unity engine integration layer | SDK | all |
| adapterVersion | String | SDK version name for adapter, should be in sync with SDK version | SDK | all |
| advertisingTrackingId | String | Advertising identifier in raw format | SDK | all |
| androidId | String | Android ID | SDK | android |
| apiLevel | Integer | Android device API level | SDK | android |
| bundleId | String | Bundle identifier for the app | SDK | all |
| bundleVersion | String | Game version | SDK | all |
| cached | Boolean | If video is cached or streamed | SDK | all |
| campaignId | String | Internal campaign identifier | Server | all |
| connectionType | String | "wifi", "cellular" or "none" | SDK | all |
| deviceMake | String | Android device manufacturer | SDK | android |
| deviceModel | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| encrypted | Boolean | If true, app is encrypted for app store distribution and game is live | SDK | all |
| eventId | String | Unique event identifier | SDK | all |
| deviceFreeSpace | Integer | Free space in kilobytes | SDK | all |
| frameworkName | String | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | String | Unity engine version | SDK | all |
| gameId | String | Source game identifier | App | all |
| gamerId | String | Internal gamer identifier | Server | all |
| language | String | Device language code (e.g. en_US or fr_CA) | SDK | all |
| limitAdTracking | Boolean | Boolean if user has limited tracking or not | SDK | all |
| mediationOrdinal | Integer | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| mediationName | String | Mediation provider name | Mediation | all |
| mediationVersion | String | Mediation SDK version | Mediation | all |
| networkOperator | String | MCC + MNC codes | SDK | all |
| networkOperatorName | String | Cell network operator name | SDK | all |
| networkType | String | Detailed cellular network type | SDK | all |
| osVersion | String | Device operating system version | SDK | all |
| placementId | String | Internal placement identifier | Admin | all |
| platform | String | "android" or "ios" | SDK | all |
| redirect | Boolean | Legacy parameter, always false | SDK | all |
| rooted | Boolean | Is the device rooted or jailbroken | SDK | all |
| screenDensity | Integer | Screen density in DPI | SDK | android |
| screenHeight | Integer | Screen height in pixels | SDK | all |
| screenSize | Integer | Android raw screen layout value | SDK | android |
| screenWidth | Integer | Screen width in pixels | SDK | all |
| sdkVersion | String | SDK version in four digits | SDK | all |
| sessionId | String | Unique ad unit session identifier. This identifies one ad unit lifecycle so e.g. start and end events share same sessionId. | SDK | all |
| sid | String | Server side reward callback id | App | all |
| skippedAt | Integer | Milliseconds from video start to video skip | SDK | all |
| test | Boolean | Test mode | App | all |
| timeZone | String | Current timezone | SDK | all |
| webviewUa | String | WebView user agent string | SDK | all |



### Configuration request
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| bundleId | all | True | False | String | Bundle identifier for the app | SDK | all |
| encrypted | all | True | False | Boolean | If true, app is encrypted for app store distribution and game is live | SDK | all |
| rooted | all | True | False | Boolean | Is the device rooted or jailbroken | SDK | all |
| frameworkName | no | True | False | String | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | True | False | String | Unity engine version | SDK | all |
| adapterName | no | True | False | String | Unity adapter between game code and SDK, "AssetStore" for Asset Store package and "Engine" for Unity engine integration layer | SDK | all |
| adapterVersion | no | True | False | String | SDK version name for adapter, should be in sync with SDK version | SDK | all |



### Ad request
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
| deviceFreeSpace | all | False | True | Integer | Free space in kilobytes | SDK | all |
| networkOperator | no | False | True | String | MCC + MNC codes | SDK | all |
| networkOperatorName | no | False | True | String | Cell network operator name | SDK | all |
| mediationName | no | False | True | String | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | String | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | Integer | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| frameworkName | no | False | True | String | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | String | Unity engine version | SDK | all |



### Video events
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| eventId | all | False | True | String | Unique event identifier | SDK | all |
| sessionId | all | False | True | String | Unique ad unit session identifier. This identifies one ad unit lifecycle so e.g. start and end events share same sessionId. | SDK | all |
| gamerId | all | False | True | String | Internal gamer identifier | Server | all |
| campaignId | all | False | True | String | Internal campaign identifier | Server | all |
| placementId | all | False | True | String | Internal placement identifier | Admin | all |
| apiLevel | android | False | True | Integer | Android device API level | SDK | android |
| cached | all | False | True | Boolean | If video is cached or streamed | SDK | all |
| advertisingTrackingId | no | False | True | String | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | False | True | Boolean | Boolean if user has limited tracking or not | SDK | all |
| osVersion | yes | False | True | String | Device operating system version | SDK | all |
| sid | no | False | True | String | Server side reward callback id | App | all |
| deviceMake | android | False | True | String | Android device manufacturer | SDK | android |
| deviceModel | all | False | True | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| sdkVersion | all | False | True | String | SDK version in four digits | SDK | all |
| webviewUa | no | False | True | String | WebView user agent string | SDK | all |
| networkType | no | False | True | String | Detailed cellular network type | SDK | all |
| connectionType | all | False | True | String | "wifi", "cellular" or "none" | SDK | all |
| mediationName | no | False | True | String | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | String | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | Integer | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| frameworkName | no | False | True | String | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | String | Unity engine version | SDK | all |



### Click event
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| gameId | all | True | False | String | Source game identifier | App | all |
| redirect | all | True | False | Boolean | Legacy parameter, always false | SDK | all |
| eventId | all | False | True | String | Unique event identifier | SDK | all |
| sessionId | all | False | True | String | Unique ad unit session identifier. This identifies one ad unit lifecycle so e.g. start and end events share same sessionId. | SDK | all |
| gamerId | all | False | True | String | Internal gamer identifier | Server | all |
| campaignId | all | False | True | String | Internal campaign identifier | Server | all |
| placementId | all | False | True | String | Internal placement identifier | Admin | all |
| apiLevel | android | False | True | Integer | Android device API level | SDK | android |
| cached | all | False | True | Boolean | If video is cached or streamed | SDK | all |
| advertisingTrackingId | no | False | True | String | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | False | True | Boolean | Boolean if user has limited tracking or not | SDK | all |
| osVersion | yes | False | True | String | Device operating system version | SDK | all |
| sid | no | False | True | String | Server side reward callback id | App | all |
| deviceMake | android | False | True | String | Android device manufacturer | SDK | android |
| deviceModel | all | False | True | String | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| sdkVersion | all | False | True | String | SDK version in four digits | SDK | all |
| webviewUa | no | False | True | String | WebView user agent string | SDK | all |
| networkType | no | False | True | String | Detailed cellular network type | SDK | all |
| connectionType | all | False | True | String | "wifi", "cellular" or "none" | SDK | all |
| mediationName | no | False | True | String | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | String | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | Integer | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| frameworkName | no | False | True | String | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | String | Unity engine version | SDK | all |

