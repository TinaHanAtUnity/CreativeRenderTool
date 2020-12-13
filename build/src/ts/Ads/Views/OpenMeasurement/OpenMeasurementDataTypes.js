export var SessionEvents;
(function (SessionEvents) {
    SessionEvents["SESSION_START"] = "sessionStart";
    SessionEvents["SESSION_ERROR"] = "sessionError";
    SessionEvents["SESSION_FINISH"] = "sessionFinish";
})(SessionEvents || (SessionEvents = {}));
export var OMID3pEvents;
(function (OMID3pEvents) {
    OMID3pEvents["VERIFICATION_RESOURCES"] = "verificationResources";
    OMID3pEvents["POPULATE_VENDOR_KEY"] = "populateVendorKey";
    OMID3pEvents["ON_EVENT_PROCESSED"] = "onEventProcessed";
    OMID3pEvents["OMID_IMPRESSION"] = "omidImpression";
    OMID3pEvents["OMID_LOADED"] = "omidLoaded";
    OMID3pEvents["OMID_START"] = "omidStart";
    OMID3pEvents["OMID_FIRST_QUARTILE"] = "omidFirstQuartile";
    OMID3pEvents["OMID_MIDPOINT"] = "omidMidpoint";
    OMID3pEvents["OMID_THIRD_QUARTILE"] = "omidThirdQuartile";
    OMID3pEvents["OMID_COMPLETE"] = "omidComplete";
    OMID3pEvents["OMID_PAUSE"] = "omidPause";
    OMID3pEvents["OMID_RESUME"] = "omidResume";
    OMID3pEvents["OMID_BUFFER_START"] = "omidBufferStart";
    OMID3pEvents["OMID_BUFFER_FINISH"] = "omidBufferFinish";
    OMID3pEvents["OMID_SKIPPED"] = "omidSkipped";
    OMID3pEvents["OMID_VOLUME_CHANGE"] = "omidVolumeChange";
    OMID3pEvents["OMID_PLAYER_STATE_CHANGE"] = "omidPlayerStateChange";
    OMID3pEvents["OMID_AD_USER_INTERACTION"] = "omidAdUserInteraction";
    OMID3pEvents["OMID_GEOMETRY_CHANGE"] = "omidGeometryChange";
    OMID3pEvents["OMID_VIDEO"] = "omidVideo";
})(OMID3pEvents || (OMID3pEvents = {}));
export var VideoPosition;
(function (VideoPosition) {
    VideoPosition["PREROLL"] = "preroll";
    VideoPosition["MIDROLL"] = "midroll";
    VideoPosition["POSTROLL"] = "postroll";
    VideoPosition["STANDALONE"] = "standalone"; // The ad plays independently of any video
})(VideoPosition || (VideoPosition = {}));
export var VideoPlayerState;
(function (VideoPlayerState) {
    VideoPlayerState["MINIMIZED"] = "minimized";
    VideoPlayerState["COLLAPSED"] = "collapsed";
    VideoPlayerState["NORMAL"] = "normal";
    VideoPlayerState["EXPANDED"] = "expanded";
    VideoPlayerState["FULLSCREEN"] = "fullscreen";
})(VideoPlayerState || (VideoPlayerState = {}));
export var InteractionType;
(function (InteractionType) {
    InteractionType["CLICK"] = "click";
    InteractionType["INVITATION_ACCEPT"] = "invitationAccept";
})(InteractionType || (InteractionType = {}));
export var ObstructionReasons;
(function (ObstructionReasons) {
    ObstructionReasons["NOT_FOUND"] = "notFound";
    ObstructionReasons["HIDDEN"] = "hidden";
    ObstructionReasons["BACKGROUNDED"] = "backgrounded";
    ObstructionReasons["OBSTRUCTED"] = "obstructed";
    ObstructionReasons["CLIPPED"] = "clipped";
})(ObstructionReasons || (ObstructionReasons = {}));
export var MediaType;
(function (MediaType) {
    MediaType["DISPLAY"] = "display";
    MediaType["VIDEO"] = "video";
})(MediaType || (MediaType = {}));
export var AccessMode;
(function (AccessMode) {
    AccessMode["FULL"] = "full";
    AccessMode["LIMITED"] = "limited"; // Verification scripts are limited to a sandboxed iframe.
})(AccessMode || (AccessMode = {}));
export var VideoEventAdaptorType;
(function (VideoEventAdaptorType) {
    VideoEventAdaptorType["JS_CUSTOM"] = "jsCustom";
    VideoEventAdaptorType["NATIVE_CUSTOM"] = "nativeCustom"; // Verification scripts are limited to a sandboxed iframe.
})(VideoEventAdaptorType || (VideoEventAdaptorType = {}));
export var AdSessionType;
(function (AdSessionType) {
    AdSessionType["NATIVE"] = "native";
    AdSessionType["HTML"] = "html";
})(AdSessionType || (AdSessionType = {}));
export const PARTNER_NAME = 'Unity3d';
export const DEFAULT_VENDOR_KEY = 'default_key';
export const OM_JS_VERSION = '1.2.10';
export const OMID_P = `${PARTNER_NAME}/${OM_JS_VERSION}`;
export const SDK_APIS = '7';
export var DoubleClickAdmobVendorTags;
(function (DoubleClickAdmobVendorTags) {
    DoubleClickAdmobVendorTags["SSP"] = "doubleclickbygoogle.com-ssp";
    DoubleClickAdmobVendorTags["DSP"] = "doubleclickbygoogle.com-dsp";
    DoubleClickAdmobVendorTags["Neutral"] = "doubleclickbygoogle.com";
})(DoubleClickAdmobVendorTags || (DoubleClickAdmobVendorTags = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50RGF0YVR5cGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9PcGVuTWVhc3VyZW1lbnQvT3Blbk1lYXN1cmVtZW50RGF0YVR5cGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sQ0FBTixJQUFZLGFBSVg7QUFKRCxXQUFZLGFBQWE7SUFDckIsK0NBQThCLENBQUE7SUFDOUIsK0NBQThCLENBQUE7SUFDOUIsaURBQWdDLENBQUE7QUFDcEMsQ0FBQyxFQUpXLGFBQWEsS0FBYixhQUFhLFFBSXhCO0FBRUQsTUFBTSxDQUFOLElBQVksWUFxQlg7QUFyQkQsV0FBWSxZQUFZO0lBQ3BCLGdFQUFnRCxDQUFBO0lBQ2hELHlEQUF5QyxDQUFBO0lBQ3pDLHVEQUF1QyxDQUFBO0lBQ3ZDLGtEQUFrQyxDQUFBO0lBQ2xDLDBDQUEwQixDQUFBO0lBQzFCLHdDQUF3QixDQUFBO0lBQ3hCLHlEQUF5QyxDQUFBO0lBQ3pDLDhDQUE4QixDQUFBO0lBQzlCLHlEQUF5QyxDQUFBO0lBQ3pDLDhDQUE4QixDQUFBO0lBQzlCLHdDQUF3QixDQUFBO0lBQ3hCLDBDQUEwQixDQUFBO0lBQzFCLHFEQUFxQyxDQUFBO0lBQ3JDLHVEQUF1QyxDQUFBO0lBQ3ZDLDRDQUE0QixDQUFBO0lBQzVCLHVEQUF1QyxDQUFBO0lBQ3ZDLGtFQUFrRCxDQUFBO0lBQ2xELGtFQUFrRCxDQUFBO0lBQ2xELDJEQUEyQyxDQUFBO0lBQzNDLHdDQUF3QixDQUFBO0FBQzVCLENBQUMsRUFyQlcsWUFBWSxLQUFaLFlBQVksUUFxQnZCO0FBRUQsTUFBTSxDQUFOLElBQVksYUFLWDtBQUxELFdBQVksYUFBYTtJQUNyQixvQ0FBbUIsQ0FBQTtJQUNuQixvQ0FBbUIsQ0FBQTtJQUNuQixzQ0FBcUIsQ0FBQTtJQUNyQiwwQ0FBeUIsQ0FBQSxDQUFDLDBDQUEwQztBQUN4RSxDQUFDLEVBTFcsYUFBYSxLQUFiLGFBQWEsUUFLeEI7QUFFRCxNQUFNLENBQU4sSUFBWSxnQkFNWDtBQU5ELFdBQVksZ0JBQWdCO0lBQ3hCLDJDQUF1QixDQUFBO0lBQ3ZCLDJDQUF1QixDQUFBO0lBQ3ZCLHFDQUFpQixDQUFBO0lBQ2pCLHlDQUFxQixDQUFBO0lBQ3JCLDZDQUF5QixDQUFBO0FBQzdCLENBQUMsRUFOVyxnQkFBZ0IsS0FBaEIsZ0JBQWdCLFFBTTNCO0FBRUQsTUFBTSxDQUFOLElBQVksZUFHWDtBQUhELFdBQVksZUFBZTtJQUN2QixrQ0FBZSxDQUFBO0lBQ2YseURBQXNDLENBQUE7QUFDMUMsQ0FBQyxFQUhXLGVBQWUsS0FBZixlQUFlLFFBRzFCO0FBbUNELE1BQU0sQ0FBTixJQUFZLGtCQU1YO0FBTkQsV0FBWSxrQkFBa0I7SUFDMUIsNENBQXNCLENBQUE7SUFDdEIsdUNBQWlCLENBQUE7SUFDakIsbURBQTZCLENBQUE7SUFDN0IsK0NBQXlCLENBQUE7SUFDekIseUNBQW1CLENBQUE7QUFDdkIsQ0FBQyxFQU5XLGtCQUFrQixLQUFsQixrQkFBa0IsUUFNN0I7QUFFRCxNQUFNLENBQU4sSUFBWSxTQUdYO0FBSEQsV0FBWSxTQUFTO0lBQ2pCLGdDQUFtQixDQUFBO0lBQ25CLDRCQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUhXLFNBQVMsS0FBVCxTQUFTLFFBR3BCO0FBRUQsTUFBTSxDQUFOLElBQVksVUFHWDtBQUhELFdBQVksVUFBVTtJQUNsQiwyQkFBYSxDQUFBO0lBQ2IsaUNBQW1CLENBQUEsQ0FBQywwREFBMEQ7QUFDbEYsQ0FBQyxFQUhXLFVBQVUsS0FBVixVQUFVLFFBR3JCO0FBRUQsTUFBTSxDQUFOLElBQVkscUJBR1g7QUFIRCxXQUFZLHFCQUFxQjtJQUM3QiwrQ0FBc0IsQ0FBQTtJQUN0Qix1REFBOEIsQ0FBQSxDQUFDLDBEQUEwRDtBQUM3RixDQUFDLEVBSFcscUJBQXFCLEtBQXJCLHFCQUFxQixRQUdoQztBQXdFRCxNQUFNLENBQU4sSUFBWSxhQUdYO0FBSEQsV0FBWSxhQUFhO0lBQ3JCLGtDQUFpQixDQUFBO0lBQ2pCLDhCQUFhLENBQUE7QUFDakIsQ0FBQyxFQUhXLGFBQWEsS0FBYixhQUFhLFFBR3hCO0FBRUQsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLFNBQVMsQ0FBQztBQUN0QyxNQUFNLENBQUMsTUFBTSxrQkFBa0IsR0FBRyxhQUFhLENBQUM7QUFDaEQsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQztBQUN0QyxNQUFNLENBQUMsTUFBTSxNQUFNLEdBQUcsR0FBRyxZQUFZLElBQUksYUFBYSxFQUFFLENBQUM7QUFDekQsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUU1QixNQUFNLENBQU4sSUFBWSwwQkFJWDtBQUpELFdBQVksMEJBQTBCO0lBQ2xDLGlFQUFtQyxDQUFBO0lBQ25DLGlFQUFtQyxDQUFBO0lBQ25DLGlFQUFtQyxDQUFBO0FBQ3ZDLENBQUMsRUFKVywwQkFBMEIsS0FBMUIsMEJBQTBCLFFBSXJDIn0=