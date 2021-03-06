import { Url } from 'Core/Utilities/Url';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
/**
 * VAST Error code defined in 3.0
 * https://wiki.iabtechlab.com/index.php?title=VAST_Error_Code_Troubleshooting_Matrix
 * https://iabtechlab.com/wp-content/uploads/2018/11/VAST4.1-final-Nov-8-2018.pdf   Page 28 for error codes
 */
export var VastErrorCode;
(function (VastErrorCode) {
    VastErrorCode[VastErrorCode["XML_PARSER_ERROR"] = 100] = "XML_PARSER_ERROR";
    VastErrorCode[VastErrorCode["SCHEMA_VAL_ERROR"] = 101] = "SCHEMA_VAL_ERROR";
    VastErrorCode[VastErrorCode["VERSION_UNSUPPORTED"] = 102] = "VERSION_UNSUPPORTED";
    VastErrorCode[VastErrorCode["FORMAT_UNSUPPORTED"] = 200] = "FORMAT_UNSUPPORTED";
    VastErrorCode[VastErrorCode["DURATION_UNSUPPORTED"] = 202] = "DURATION_UNSUPPORTED";
    VastErrorCode[VastErrorCode["SIZE_UNSUPPORTED"] = 203] = "SIZE_UNSUPPORTED";
    VastErrorCode[VastErrorCode["WRAPPER_GENERAL_ERROR"] = 300] = "WRAPPER_GENERAL_ERROR";
    VastErrorCode[VastErrorCode["WRAPPER_URI_TIMEOUT"] = 301] = "WRAPPER_URI_TIMEOUT";
    VastErrorCode[VastErrorCode["WRAPPER_DEPTH_LIMIT_REACHED"] = 302] = "WRAPPER_DEPTH_LIMIT_REACHED";
    VastErrorCode[VastErrorCode["WRAPPER_NO_ADS_FOUND"] = 303] = "WRAPPER_NO_ADS_FOUND";
    VastErrorCode[VastErrorCode["LINEAR_UNABLE_TO_PLAY"] = 400] = "LINEAR_UNABLE_TO_PLAY";
    VastErrorCode[VastErrorCode["MEDIA_FILE_URL_NOT_FOUND"] = 401] = "MEDIA_FILE_URL_NOT_FOUND";
    VastErrorCode[VastErrorCode["MEDIA_FILE_TIMEOUT"] = 402] = "MEDIA_FILE_TIMEOUT";
    VastErrorCode[VastErrorCode["MEDIA_FILE_UNSUPPORTED"] = 403] = "MEDIA_FILE_UNSUPPORTED";
    VastErrorCode[VastErrorCode["MEDIA_FILE_UNSUPPORTED_IOS"] = 404] = "MEDIA_FILE_UNSUPPORTED_IOS";
    VastErrorCode[VastErrorCode["MEDIA_FILE_PLAY_ERROR"] = 405] = "MEDIA_FILE_PLAY_ERROR";
    VastErrorCode[VastErrorCode["MEDIA_FILE_NO_CLICKTHROUGH_URL"] = 499] = "MEDIA_FILE_NO_CLICKTHROUGH_URL";
    VastErrorCode[VastErrorCode["COMPANION_GENERAL_ERROR"] = 600] = "COMPANION_GENERAL_ERROR";
    VastErrorCode[VastErrorCode["COMPANION_SIZE_UNSUPPORTED"] = 601] = "COMPANION_SIZE_UNSUPPORTED";
    VastErrorCode[VastErrorCode["COMPANION_UNABLE_TO_DISPLAY"] = 602] = "COMPANION_UNABLE_TO_DISPLAY";
    VastErrorCode[VastErrorCode["COMPANION_UNABLE_TO_FETCH"] = 603] = "COMPANION_UNABLE_TO_FETCH";
    VastErrorCode[VastErrorCode["COMPANION_RESOURCE_NOT_FOUND"] = 604] = "COMPANION_RESOURCE_NOT_FOUND";
    VastErrorCode[VastErrorCode["COMPANION_NO_CLICKTHROUGH"] = 699] = "COMPANION_NO_CLICKTHROUGH";
    VastErrorCode[VastErrorCode["UNDEFINED_ERROR"] = 900] = "UNDEFINED_ERROR";
    VastErrorCode[VastErrorCode["GENERAL_VPAID_ERROR"] = 901] = "GENERAL_VPAID_ERROR";
    VastErrorCode[VastErrorCode["INVALID_URL_ERROR"] = 998] = "INVALID_URL_ERROR";
    VastErrorCode[VastErrorCode["UNKNOWN_ERROR"] = 999] = "UNKNOWN_ERROR";
})(VastErrorCode || (VastErrorCode = {}));
export class VastErrorInfo {
}
VastErrorInfo.errorMap = {
    [VastErrorCode.XML_PARSER_ERROR]: 'VAST xml parsing error',
    [VastErrorCode.SCHEMA_VAL_ERROR]: 'VAST schema validation error',
    [VastErrorCode.VERSION_UNSUPPORTED]: 'VAST version Unsupported',
    [VastErrorCode.FORMAT_UNSUPPORTED]: 'VAST format unsupported',
    [VastErrorCode.DURATION_UNSUPPORTED]: 'VAST linear creative is missing valid duration',
    [VastErrorCode.SIZE_UNSUPPORTED]: 'VAST size unsupported',
    [VastErrorCode.WRAPPER_GENERAL_ERROR]: 'Wrapper ad request failed',
    [VastErrorCode.WRAPPER_URI_TIMEOUT]: 'Wrapper ad request timed out',
    [VastErrorCode.WRAPPER_DEPTH_LIMIT_REACHED]: 'Wrapper depth exceeded',
    [VastErrorCode.WRAPPER_NO_ADS_FOUND]: 'No ads found in Wrapper response',
    [VastErrorCode.LINEAR_UNABLE_TO_PLAY]: 'General error from Linear Ad',
    [VastErrorCode.MEDIA_FILE_URL_NOT_FOUND]: 'No video URL found for VAST',
    [VastErrorCode.MEDIA_FILE_TIMEOUT]: 'Media file URI timed out',
    [VastErrorCode.MEDIA_FILE_UNSUPPORTED]: 'No Media file found supported in Video Player',
    [VastErrorCode.MEDIA_FILE_UNSUPPORTED_IOS]: 'Campaign video url needs to be https for iOS',
    [VastErrorCode.MEDIA_FILE_PLAY_ERROR]: 'Problem displaying Media file',
    [VastErrorCode.MEDIA_FILE_NO_CLICKTHROUGH_URL]: 'Media file is missing valid ClickThrough URL',
    // code 5xx for Non-Linear ads
    [VastErrorCode.COMPANION_GENERAL_ERROR]: 'General error from Companion Ad',
    [VastErrorCode.COMPANION_SIZE_UNSUPPORTED]: 'Companion creative size unsupported',
    [VastErrorCode.COMPANION_UNABLE_TO_DISPLAY]: 'Companion unable to display',
    [VastErrorCode.COMPANION_UNABLE_TO_FETCH]: 'Unable to fetch Companion resource',
    [VastErrorCode.COMPANION_RESOURCE_NOT_FOUND]: 'Supported Companion resource not found',
    [VastErrorCode.COMPANION_NO_CLICKTHROUGH]: 'Companion is missing valid ClickThrough URL',
    [VastErrorCode.UNDEFINED_ERROR]: 'Undefined Error',
    [VastErrorCode.GENERAL_VPAID_ERROR]: 'General VPAID error',
    [VastErrorCode.INVALID_URL_ERROR]: 'Provided URL is invalid',
    [VastErrorCode.UNKNOWN_ERROR]: 'Unknown Error'
};
export class VastCampaignErrorHandler {
    constructor(core, request) {
        this._request = request;
        this._core = core;
    }
    handleCampaignError(campaignError) {
        const errorList = campaignError.getAllCampaignErrors();
        for (const oneError of errorList) {
            const errorTrackingUrls = oneError.errorTrackingUrls;
            for (const errorTrackingUrl of errorTrackingUrls) {
                const errorCode = oneError.errorCode ? oneError.errorCode : VastErrorCode.UNDEFINED_ERROR;
                const errorUrl = this.formatVASTErrorURL(errorTrackingUrl, errorCode, oneError.assetUrl);
                this._request.get(errorUrl, []);
                Diagnostics.trigger('vast_error_tracking_sent', {
                    errorUrl: errorUrl,
                    errorCode: errorCode,
                    errorMessage: VastErrorInfo.errorMap[errorCode] || 'not found',
                    erroLevel: oneError.errorLevel,
                    seatId: oneError.seatId || -1,
                    creativeId: oneError.creativeId || 'not found'
                });
            }
        }
        return Promise.resolve();
    }
    formatVASTErrorURL(errorUrl, errorCode, assetUrl) {
        let formattedUrl = errorUrl.replace(/\[ERRORCODE\]|%5BERRORCODE%5D/ig, errorCode.toString());
        if (assetUrl) {
            formattedUrl = formattedUrl.replace(/\[ASSETURI\]|%5BASSETURI%5D/ig, Url.encodeParam(assetUrl));
        }
        return formattedUrl;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdENhbXBhaWduRXJyb3JIYW5kbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvRXZlbnRIYW5kbGVycy9WYXN0Q2FtcGFpZ25FcnJvckhhbmRsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxFQUFFLEdBQUcsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3pDLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUV6RDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFOLElBQVksYUE0Qlg7QUE1QkQsV0FBWSxhQUFhO0lBQ3JCLDJFQUFzQixDQUFBO0lBQ3RCLDJFQUFzQixDQUFBO0lBQ3RCLGlGQUF5QixDQUFBO0lBQ3pCLCtFQUF3QixDQUFBO0lBQ3hCLG1GQUEwQixDQUFBO0lBQzFCLDJFQUFzQixDQUFBO0lBQ3RCLHFGQUEyQixDQUFBO0lBQzNCLGlGQUF5QixDQUFBO0lBQ3pCLGlHQUFpQyxDQUFBO0lBQ2pDLG1GQUEwQixDQUFBO0lBQzFCLHFGQUEyQixDQUFBO0lBQzNCLDJGQUE4QixDQUFBO0lBQzlCLCtFQUF3QixDQUFBO0lBQ3hCLHVGQUE0QixDQUFBO0lBQzVCLCtGQUFnQyxDQUFBO0lBQ2hDLHFGQUEyQixDQUFBO0lBQzNCLHVHQUFvQyxDQUFBO0lBQ3BDLHlGQUE2QixDQUFBO0lBQzdCLCtGQUFnQyxDQUFBO0lBQ2hDLGlHQUFpQyxDQUFBO0lBQ2pDLDZGQUErQixDQUFBO0lBQy9CLG1HQUFrQyxDQUFBO0lBQ2xDLDZGQUErQixDQUFBO0lBQy9CLHlFQUFxQixDQUFBO0lBQ3JCLGlGQUF5QixDQUFBO0lBQ3pCLDZFQUF1QixDQUFBO0lBQ3ZCLHFFQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUE1QlcsYUFBYSxLQUFiLGFBQWEsUUE0QnhCO0FBQ0QsTUFBTSxPQUFPLGFBQWE7O0FBQ1Isc0JBQVEsR0FBOEI7SUFDaEQsQ0FBQyxhQUFhLENBQUMsZ0JB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