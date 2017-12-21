

### TOC
[All Parameters](#all-parameters)  
[Configuration request](#configuration-request)  
[Ad request](#ad-request)  
[Video events](#video-events)  
[Click event](#click-event)  


### All Parameters
| key | type | description | provider | platforms |
|---|---|---|---|---|
| adapterName | string | Unity adapter between game code and SDK, "AssetStore" for Asset Store package and "Engine" for Unity engine integration layer | SDK | all |
| adapterVersion | string | SDK version name for adapter, should be in sync with SDK version | SDK | all |
| advertisingTrackingId | string | Advertising identifier in raw format | SDK | all |
| androidId | string | Android ID | SDK | android |
| apiLevel | number | Android device API level | SDK | android |
| auctionId | string | Unique identifier for joining ad requests and operative events. This identifies one ad unit lifecycle so e.g. ad request, start and end events share same auctionId. | SDK | all |
| bundleId | string | Bundle identifier for the app | SDK | all |
| bundleVersion | string | Game version | SDK | all |
| cached | boolean | If video is cached or streamed | SDK | all |
| campaignId | string | Internal campaign identifier | Server | all |
| connectionType | string | "wifi", "cellular" or "none" | SDK | all |
| coppa | boolean | True for COPPA compliant (games targeted for children) | Server | all |
| deviceMake | string | Android device manufacturer | SDK | android |
| deviceModel | string | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| encrypted | boolean | If true, app is encrypted for app store distribution and game is live | SDK | all |
| eventId | string | Unique event identifier | SDK | all |
| deviceFreeSpace | number | Free space in kilobytes | SDK | all |
| frameworkName | string | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | string | Unity engine version | SDK | all |
| forceAbGroup | number | Force A/B group for internal testing purposes | SDK | all |
| forceCampaignId | string | Force campaign ID for internal testing purposes | SDK | all |
| force_country | string | Force country targeting for internal testing purposes | SDK | all |
| gameId | string | Source game identifier | App | all |
| gamerId | string | Internal gamer identifier | Server | all |
| gameSessionId | number | Unique game session identifier. This identifier is shared with analytics events. | SDK | all |
| language | string | Device language code (e.g. en_US or fr_CA) | SDK | all |
| limitAdTracking | boolean | boolean if user has limited tracking or not | SDK | all |
| mediationOrdinal | number | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| mediationName | string | Mediation provider name | Mediation | all |
| mediationVersion | string | Mediation SDK version | Mediation | all |
| meta | string | Encrypted data passed through the SDK | Server | all |
| networkOperator | string | MCC + MNC codes | SDK | all |
| networkOperatorName | string | Cell network operator name | SDK | all |
| networkType | number | Detailed cellular network type | SDK | all |
| osVersion | string | Device operating system version | SDK | all |
| placementId | string | Internal placement identifier | Admin | all |
| platform | string | "android" or "ios" | SDK | all |
| redirect | boolean | Legacy parameter, always false | SDK | all |
| rooted | boolean | Is the device rooted or jailbroken | SDK | all |
| screenDensity | number | Screen density in DPI | SDK | android |
| screenHeight | number | Screen height in pixels | SDK | all |
| screenSize | number | Android raw screen layout value | SDK | android |
| screenWidth | number | Screen width in pixels | SDK | all |
| sdkVersion | number | SDK version in four digits | SDK | all |
| sid | string | Server side reward callback id | App | all |
| skippedAt | number | Milliseconds from video start to video skip | SDK | all |
| stores | string | List of stores on device. ('apple', 'google', 'xiaomi,google', 'none') | SDK | all |
| test | boolean | Test mode | App | all |
| timeZone | string | Current timezone | SDK | all |
| webviewUa | string | WebView user agent string | SDK | all |
| videoOrientation | string | Chosen video orientation | SDK | all |
| cachedOrientation | string | Cached video orientation | SDK | all |
| cachedCampaigns | object | Campaign ID's which are fully cached on the device | SDK | all |
| previousPlacementId | string | Previously shown placementId | SDK | all |
| properties | string | Gamer specific parameters | Server | all |
| placements | object | All placements received in configuration | Server | all |
| wiredHeadset | boolean | If wired headset is connected to device | SDK | all |
| volume | number | On iOS, this is a float between 0 (silent) and 1 (max volume), on Android, this is integer from 0 (silent) to max volume index | SDK | all |
| versionCode | number | Application internal version code for Android apps, available only for SDK 2.1.1 and later | SDK | android |
| simulator | boolean | If device is a simulator, not a real device | SDK | ios |
| requestSignal | string | Base64 encoded string from AdMob protobuf signals | SDK | all |
| realtimeRequest | boolean | If ad request is done at show time for immediate streaming | SDK | all |



### Configuration request
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| bundleId | all | True | False | string | Bundle identifier for the app | SDK | all |
| encrypted | all | True | False | boolean | If true, app is encrypted for app store distribution and game is live | SDK | all |
| rooted | all | True | False | boolean | Is the device rooted or jailbroken | SDK | all |
| platform | all | True | False | string | "android" or "ios" | SDK | all |
| sdkVersion | all | True | False | number | SDK version in four digits | SDK | all |
| osVersion | all | True | False | string | Device operating system version | SDK | all |
| deviceModel | all | True | False | string | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| language | all | True | False | string | Device language code (e.g. en_US or fr_CA) | SDK | all |
| test | all | True | False | boolean | Test mode | App | all |
| forceAbGroup | no | True | False | number | Force A/B group for internal testing purposes | SDK | all |
| gamerId | no | True | False | string | Internal gamer identifier | Server | all |
| deviceMake | android | True | False | string | Android device manufacturer | SDK | android |
| advertisingTrackingId | no | True | False | string | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | True | False | boolean | boolean if user has limited tracking or not | SDK | all |
| androidId | no | True | False | string | Android ID | SDK | android |
| frameworkName | no | True | False | string | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | True | False | string | Unity engine version | SDK | all |
| adapterName | no | True | False | string | Unity adapter between game code and SDK, "AssetStore" for Asset Store package and "Engine" for Unity engine integration layer | SDK | all |
| adapterVersion | no | True | False | string | SDK version name for adapter, should be in sync with SDK version | SDK | all |



### Ad request
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| advertisingTrackingId | no | True | False | string | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | True | False | boolean | boolean if user has limited tracking or not | SDK | all |
| androidId | no | True | False | string | Android ID | SDK | android |
| auctionId | all | True | False | string | Unique identifier for joining ad requests and operative events. This identifies one ad unit lifecycle so e.g. ad request, start and end events share same auctionId. | SDK | all |
| deviceMake | android | True | False | string | Android device manufacturer | SDK | android |
| deviceModel | all | True | False | string | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| platform | all | True | False | string | "android" or "ios" | SDK | all |
| screenDensity | android | True | False | number | Screen density in DPI | SDK | android |
| screenWidth | all | True | False | number | Screen width in pixels | SDK | all |
| screenHeight | all | True | False | number | Screen height in pixels | SDK | all |
| sdkVersion | all | True | False | number | SDK version in four digits | SDK | all |
| screenSize | android | True | False | number | Android raw screen layout value | SDK | android |
| osVersion | ios | True | False | string | Device operating system version | SDK | all |
| apiLevel | android | True | False | number | Android device API level | SDK | android |
| test | no | True | False | boolean | Test mode | App | all |
| connectionType | all | True | False | string | "wifi", "cellular" or "none" | SDK | all |
| networkType | no | True | False | number | Detailed cellular network type | SDK | all |
| stores | yes | True | False | string | List of stores on device. ('apple', 'google', 'xiaomi,google', 'none') | SDK | all |
| gamerId | yes | True | False | string | Internal gamer identifier | Server | all |
| bundleVersion | all | False | True | string | Game version | SDK | all |
| bundleId | all | False | True | string | Bundle identifier for the app | SDK | all |
| language | all | False | True | string | Device language code (e.g. en_US or fr_CA) | SDK | all |
| timeZone | all | False | True | string | Current timezone | SDK | all |
| webviewUa | no | False | True | string | WebView user agent string | SDK | all |
| deviceFreeSpace | all | False | True | number | Free space in kilobytes | SDK | all |
| networkOperator | no | False | True | string | MCC + MNC codes | SDK | all |
| coppa | all | False | True | boolean | True for COPPA compliant (games targeted for children) | Server | all |
| networkOperatorName | no | False | True | string | Cell network operator name | SDK | all |
| gameSessionId | all | False | True | number | Unique game session identifier. This identifier is shared with analytics events. | SDK | all |
| mediationName | no | False | True | string | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | string | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | number | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| frameworkName | no | False | True | string | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | string | Unity engine version | SDK | all |
| forceAbGroup | no | True | False | number | Force A/B group for internal testing purposes | SDK | all |
| forceCampaignId | no | True | False | string | Force campaign ID for internal testing purposes | SDK | all |
| force_country | no | True | False | string | Force country targeting for internal testing purposes | SDK | all |
| cachedCampaigns | no | False | True | object | Campaign ID's which are fully cached on the device | SDK | all |
| previousPlacementId | no | False | True | string | Previously shown placementId | SDK | all |
| properties | all | False | True | string | Gamer specific parameters | Server | all |
| placements | all | False | True | object | All placements received in configuration | Server | all |
| wiredHeadset | all | False | True | boolean | If wired headset is connected to device | SDK | all |
| volume | all | False | True | number | On iOS, this is a float between 0 (silent) and 1 (max volume), on Android, this is integer from 0 (silent) to max volume index | SDK | all |
| versionCode | no | False | True | number | Application internal version code for Android apps, available only for SDK 2.1.1 and later | SDK | android |
| simulator | ios | False | True | boolean | If device is a simulator, not a real device | SDK | ios |
| requestSignal | all | False | True | string | Base64 encoded string from AdMob protobuf signals | SDK | all |
| realtimeRequest | all | True | False | boolean | If ad request is done at show time for immediate streaming | SDK | all |



### Video events
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| eventId | all | False | True | string | Unique event identifier | SDK | all |
| auctionId | all | False | True | string | Unique identifier for joining ad requests and operative events. This identifies one ad unit lifecycle so e.g. ad request, start and end events share same auctionId. | SDK | all |
| gameSessionId | all | False | True | number | Unique game session identifier. This identifier is shared with analytics events. | SDK | all |
| gamerId | all | False | True | string | Internal gamer identifier | Server | all |
| campaignId | all | False | True | string | Internal campaign identifier | Server | all |
| placementId | all | False | True | string | Internal placement identifier | Admin | all |
| apiLevel | android | False | True | number | Android device API level | SDK | android |
| cached | all | False | True | boolean | If video is cached or streamed | SDK | all |
| advertisingTrackingId | no | False | True | string | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | False | True | boolean | boolean if user has limited tracking or not | SDK | all |
| osVersion | yes | False | True | string | Device operating system version | SDK | all |
| sid | no | False | True | string | Server side reward callback id | App | all |
| deviceMake | android | False | True | string | Android device manufacturer | SDK | android |
| deviceModel | all | False | True | string | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| sdkVersion | all | False | True | number | SDK version in four digits | SDK | all |
| webviewUa | no | False | True | string | WebView user agent string | SDK | all |
| networkType | no | False | True | number | Detailed cellular network type | SDK | all |
| connectionType | all | False | True | string | "wifi", "cellular" or "none" | SDK | all |
| mediationName | no | False | True | string | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | string | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | number | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| meta | no | False | True | string | Encrypted data passed through the SDK | Server | all |
| frameworkName | no | False | True | string | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | string | Unity engine version | SDK | all |
| screenWidth | yes | False | True | number | Screen width in pixels | SDK | all |
| screenHeight | yes | False | True | number | Screen height in pixels | SDK | all |
| videoOrientation | no | False | True | string | Chosen video orientation | SDK | all |
| cachedOrientation | no | False | True | string | Cached video orientation | SDK | all |
| previousPlacementId | no | False | True | string | Previously shown placementId | SDK | all |
| bundleId | yes | False | True | string | Bundle identifier for the app | SDK | all |
| screenDensity | android | False | True | number | Screen density in DPI | SDK | android |
| screenSize | android | False | True | number | Android raw screen layout value | SDK | android |
| platform | all | False | True | string | "android" or "ios" | SDK | all |
| language | all | False | True | string | Device language code (e.g. en_US or fr_CA) | SDK | all |



### Click event
| key | required | queryString | body | type | description | provider | platforms |
|---|---|---|---|---|---|---|---|
| gameId | all | True | False | string | Source game identifier | App | all |
| redirect | all | True | False | boolean | Legacy parameter, always false | SDK | all |
| eventId | all | False | True | string | Unique event identifier | SDK | all |
| auctionId | all | False | True | string | Unique identifier for joining ad requests and operative events. This identifies one ad unit lifecycle so e.g. ad request, start and end events share same auctionId. | SDK | all |
| gameSessionId | all | False | True | number | Unique game session identifier. This identifier is shared with analytics events. | SDK | all |
| gamerId | all | False | True | string | Internal gamer identifier | Server | all |
| campaignId | all | False | True | string | Internal campaign identifier | Server | all |
| placementId | all | False | True | string | Internal placement identifier | Admin | all |
| apiLevel | android | False | True | number | Android device API level | SDK | android |
| cached | all | False | True | boolean | If video is cached or streamed | SDK | all |
| advertisingTrackingId | no | False | True | string | Advertising identifier in raw format | SDK | all |
| limitAdTracking | no | False | True | boolean | boolean if user has limited tracking or not | SDK | all |
| osVersion | yes | False | True | string | Device operating system version | SDK | all |
| sid | no | False | True | string | Server side reward callback id | App | all |
| deviceMake | android | False | True | string | Android device manufacturer | SDK | android |
| deviceModel | all | False | True | string | Android or iOS device model, example 'iPhone7,1' | SDK | all |
| sdkVersion | all | False | True | number | SDK version in four digits | SDK | all |
| webviewUa | no | False | True | string | WebView user agent string | SDK | all |
| networkType | no | False | True | number | Detailed cellular network type | SDK | all |
| connectionType | all | False | True | string | "wifi", "cellular" or "none" | SDK | all |
| mediationName | no | False | True | string | Mediation provider name | Mediation | all |
| mediationVersion | no | False | True | string | Mediation SDK version | Mediation | all |
| mediationOrdinal | no | False | True | number | Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5 | Mediation | all |
| meta | no | False | True | string | Encrypted data passed through the SDK | Server | all |
| frameworkName | no | False | True | string | Game framework, both Asset Store package and engine integration set this to "Unity" | SDK | all |
| frameworkVersion | no | False | True | string | Unity engine version | SDK | all |
| screenWidth | yes | False | True | number | Screen width in pixels | SDK | all |
| screenHeight | yes | False | True | number | Screen height in pixels | SDK | all |
| bundleId | yes | False | True | string | Bundle identifier for the app | SDK | all |
| screenDensity | android | False | True | number | Screen density in DPI | SDK | android |
| screenSize | android | False | True | number | Android raw screen layout value | SDK | android |
| platform | all | False | True | string | "android" or "ios" | SDK | all |
| language | all | False | True | string | Device language code (e.g. en_US or fr_CA) | SDK | all |

