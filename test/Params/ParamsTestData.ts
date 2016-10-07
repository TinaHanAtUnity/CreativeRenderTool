export class ParamsTestData {
    public static Params: string = `[
{
    "key": "abGroup",
    "type": "Integer",
    "description": "Integer from 0 to 19",
    "provider": "Server",
    "platforms": null
},
{
    "key": "adapterName",
    "type": "String",
    "description": "Unity adapter between game code and SDK, \"AssetStore\" for Asset Store package and \"Engine\" for Unity engine integration layer",
    "provider": "App",
    "platforms": "all"
},
{
    "key": "adapterVersion",
    "type": "String",
    "description": "SDK version name for adapter, should be in sync with SDK version",
    "provider": "App",
    "platforms": "all"
},
{
    "key": "advertisingId",
    "type": "String",
    "description": "Advertising identifier in raw format TODO: remove duplicate",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "advertisingTrackingId",
    "type": "String",
    "description": "Advertising identifier in raw format",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "androidId",
    "type": "String",
    "description": "Android ID",
    "provider": "SDK",
    "platforms": "android"
},
{
    "key": "apiLevel",
    "type": "Integer",
    "description": "Android device API level",
    "provider": "SDK",
    "platforms": "android"
},
{
    "key": "applicationMuted",
    "type": "Boolean",
    "description": "If game has been muted",
    "provider": "App",
    "platforms": null
},
{
    "key": "applicationOrientation",
    "type": "String",
    "description": "Configured/Allowed orientations for the app",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "batteryLevel",
    "type": "Integer",
    "description": "Precentage of battery charging status",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "batteryStatus",
    "type": "String",
    "description": "Charging / Full / Draining etc.",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "bundleId",
    "type": "String",
    "description": "Bundle identifier for the app",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "bundleVersion",
    "type": "String",
    "description": "Game version",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "cached",
    "type": "Boolean",
    "description": "If video is cached or streamed",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "cachingDuration",
    "type": "Integer",
    "description": "Milliseconds taken to cache",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "cachingSize",
    "type": "Integer",
    "description": "Size of the asset cached",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "campaignId",
    "type": "String",
    "description": "Internal campaign identifier",
    "provider": "Server",
    "platforms": null
},
{
    "key": "connectionType",
    "type": "String",
    "description": "\"wifi\", \"cellular\" or \"none\"",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "country",
    "type": "String",
    "description": "2 character country code",
    "provider": "Server",
    "platforms": null
},
{
    "key": "currentOrientation",
    "type": "String",
    "description": "Current orientation at the time of the event",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceFreeMemory",
    "type": "Integer",
    "description": "Free memory in kilobytes",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceHeadset",
    "type": "Boolean",
    "description": "Boolean if user has headset plugged in",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceMake",
    "type": "String",
    "description": "Android device manufacturer",
    "provider": "SDK",
    "platforms": "android"
},
{
    "key": "deviceModel",
    "type": "String",
    "description": "Android or iOS device model, example 'iPhone7,1'",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "deviceRingerMode",
    "type": "String",
    "description": "Silent / Vibrate / Sound ()",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceRingerMode",
    "type": "String",
    "description": "Silent / Vibrate / Sound",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceTotalMemory",
    "type": "Integer",
    "description": "Total memory in kilobytes",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceTotalSpace",
    "type": "Integer",
    "description": "Total space in kilobytes",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "deviceVolume",
    "type": "Integer",
    "description": "Device volume",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "encrypted",
    "type": "Boolean",
    "description": "If true, app is encrypted for app store distribution and game is live",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "eventId",
    "type": "String",
    "description": "Unique event identifier",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "eventType",
    "type": "String",
    "description": "Event type",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "frameworkName",
    "type": "String",
    "description": "The framework/game toolkit used to build the game, for example: Unity",
    "provider": "App",
    "platforms": null
},
{
    "key": "frameworkVersion",
    "type": "String",
    "description": "For instance: 5.3.1p3",
    "provider": "App",
    "platforms": null
},
{
    "key": "freeSpace",
    "type": "Integer",
    "description": "Free space in kilobytes",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "gameId",
    "type": "String",
    "description": "Source game identifier",
    "provider": "App",
    "platforms": null
},
{
    "key": "gamerId",
    "type": "String",
    "description": "Internal gamer identifier",
    "provider": "Server",
    "platforms": "all"
},
{
    "key": "integrationType",
    "type": "string",
    "description": "\"AssetStore\",\"Engine\",\"native\",\"mediation\"",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "language",
    "type": "String",
    "description": "Device language code (e.g. en_US or fr_CA)",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "limitAdTracking",
    "type": "Boolean",
    "description": "Boolean if user has limited tracking or not",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "mediation",
    "type": "JSONobject",
    "description": "mediation data in JSON object (Will get refactored)",
    "provider": "App",
    "platforms": "all"
},
{
    "key": "mediationOrdinal",
    "type": "Integer",
    "description": "Ordinal for ad unit in a game with multiple ad networks and mediation, e.g. for fifth ad in a game this is 5",
    "provider": "Mediation",
    "platforms": "all"
},
{
    "key": "mediationName",
    "type": "String",
    "description": "Mediation provider name",
    "provider": "Mediation",
    "platforms": "all"
},
{
    "key": "mediationVersion",
    "type": "String",
    "description": "Mediation SDK version",
    "provider": "Mediation",
    "platforms": "all"
},
{
    "key": "muted",
    "type": "Boolean",
    "description": "Is the video muted from the UI",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "networkOperator",
    "type": "Integer",
    "description": "MCC + MNC codes",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "networkOperatorName",
    "type": "Integer",
    "description": "Cell network operator name",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "networkType",
    "type": "String",
    "description": "Detailed cellular network type",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "osVersion",
    "type": "String",
    "description": "Device operating system version",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "placementId",
    "type": "String",
    "description": "Internal placement identifier",
    "provider": "Admin",
    "platforms": null
},
{
    "key": "placementType",
    "type": "String",
    "description": "\"rewarded\" or \"interstitial\"",
    "provider": "Admin",
    "platforms": null
},
{
    "key": "platform",
    "type": "String",
    "description": "\"android\" or \"ios\"",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "redirect",
    "type": "Boolean",
    "description": "TODO: What does this do?",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "retryCount",
    "type": "Integer",
    "description": "How many times this event_id has been retried",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "rooted",
    "type": "Boolean",
    "description": "Is the device rooted or jailbroken",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "screenBrightness",
    "type": "Integer",
    "description": "Brightness value",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "screenDensity",
    "type": "Integer",
    "description": "Screen density in DPI",
    "provider": "SDK",
    "platforms": "android"
},
{
    "key": "screenHeight",
    "type": "Integer",
    "description": "Screen height in pixels",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "screenSize",
    "type": "Integer",
    "description": "Android raw screen layout value",
    "provider": "SDK",
    "platforms": "android"
},
{
    "key": "screenWidth",
    "type": "Integer",
    "description": "Screen width in pixels",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "sdkVersion",
    "type": "String",
    "description": "SDK version in four digits",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "sessionId",
    "type": "String",
    "description": "Unique session identifier",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "sid",
    "type": "String",
    "description": "Server side reward callback id",
    "provider": "App",
    "platforms": null
},
{
    "key": "skippableAt",
    "type": "Integer",
    "description": "Milliseconds when user can skip",
    "provider": "Admin",
    "platforms": null
},
{
    "key": "skippedAt",
    "type": "Integer",
    "description": "Milliseconds from video start when it was skipped",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "test",
    "type": "Boolean",
    "description": "Test mode",
    "provider": "App",
    "platforms": "all"
},
{
    "key": "timestamp",
    "type": "Integer",
    "description": "Local time of triggering the event",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "timeZone",
    "type": "String",
    "description": "Current timezone",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "trackingEnabled",
    "type": "Boolean",
    "description": "Boolean if user has limited tracking or not TODO: remove duplicate",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "userAgent",
    "type": "String",
    "description": "WebView user agent",
    "provider": "SDK",
    "platforms": null
},
{
    "key": "videoLength",
    "type": "Integer",
    "description": "Video length in milliseconds",
    "provider": "Admin",
    "platforms": null
},
{
    "key": "webviewUa",
    "type": "String",
    "description": "WebView user agent string",
    "provider": "SDK",
    "platforms": "all"
},
{
    "key": "webviewVersion",
    "type": "String",
    "description": "WebView version",
    "provider": "SDK",
    "platforms": null
}
]`;
    public static AdRequest: string = `{
  "event": "Ad request",
  "parameters": [
    {
      "parameter": "advertisingTrackingId",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "limitAdTracking",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "androidId",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "deviceMake",
      "required": "android",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "deviceModel",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "platform",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "screenDensity",
      "required": "android",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "screenWidth",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "screenHeight",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "sdkVersion",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "screenSize",
      "required": "android",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "osVersion",
      "required": "ios",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "apiLevel",
      "required": "android",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "test",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "connectionType",
      "required": "all",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "networkType",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "gamerId",
      "required": "no",
      "queryString": true,
      "body": false
    },
    {
      "parameter": "bundleVersion",
      "required": "all",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "bundleId",
      "required": "all",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "language",
      "required": "all",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "timeZone",
      "required": "all",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "webviewUa",
      "required": "no",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "freeSpace",
      "required": "all",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "networkOperator",
      "required": "no",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "networkOperatorName",
      "required": "no",
      "queryString": false,
      "body": true
    },
    {
      "parameter": "mediation",
      "required": "no",
      "queryString": false,
      "body": true
    }
  ]
}`;
}