import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Request, INativeResponse } from 'Core/Utilities/Request';
import { Vast } from 'VAST/Models/Vast';

// VAST Error code defined in 3.0
// https://wiki.iabtechlab.com/index.php?title=VAST_Error_Code_Troubleshooting_Matrix
export enum VastErrorCode {
    XML_PARSER_ERROR = 100,
    SCHEMA_VAL_ERROR = 101,
    VERSION_UNSUPPORTED = 102,
    FORMAT_UNSUPPORTED = 200,
    DURATION_UNSUPPORTED = 202,
    SIZE_UNSUPPORTED = 203,
    WRAPPER_GENERAL_ERROR = 300,
    WRAPPER_URI_TIMEOUT = 301,
    WRAPPER_LIMIT_REACHED = 302,
    WRAPPER_NO_ADS_FOUND = 303,
    LINEAR_UNABLE_TO_PLAY = 400,
    MEDIA_FILE_NOT_FOUND = 401,
    MEDIA_FILE_TIMEOUT = 402,
    MEDIA_FILE_UNSUPPORTED = 403,
    MEDIA_FILE_UNSUPPORTED_IOS = 404,
    MEDIA_FILE_PLAY_ERROR = 405,
    COMPANION_GENERAL_ERROR = 600,   // code 5xx for Non-Linear ads
    COMPANION_SIZE_UNSUPPORTED = 601,
    COMPANION_UNABLE_TO_DISPLAY = 602,
    COMPANION_UNABLE_TO_FETCH = 603,
    COMPANION_RESOURCE_NOT_FOUND = 604,
    UNDEFINED_ERROR = 900,
    GENERAL_VPAID_ERROR = 901
}

export enum VastErrorMessage {
    XML_PARSER_ERROR = 'VAST xml data is missing',
    SCHEMA_VAL_ERROR = 'VAST schema validation error',
    VERSION_UNSUPPORTED = 'VAST version Unsupported',
    FORMAT_UNSUPPORTED = 'VAST format unsupported',
    DURATION_UNSUPPORTED = 'VAST duration unsupported',
    SIZE_UNSUPPORTED = 'VAST size unsupported',
    WRAPPER_GENERAL_ERROR = 'Wrapper ad request failed',
    WRAPPER_URI_TIMEOUT = 'Wrapper ad request timed out',
    WRAPPER_LIMIT_REACHED = 'VAST wrapper depth exceeded',
    WRAPPER_NO_ADS_FOUND = 'No ads found in Wrapper response',
    LINEAR_UNABLE_TO_PLAY = 'General error from Linear Ad',
    MEDIA_FILE_NOT_FOUND = 'No video URL found for VAST',
    MEDIA_FILE_TIMEOUT = 'Media file URI timed out',
    MEDIA_FILE_UNSUPPORTED = 'No Media file found supported in Video Player',
    MEDIA_FILE_UNSUPPORTED_IOS = 'Campaign video url needs to be https for iOS',
    MEDIA_FILE_PLAY_ERROR = 'Problem displaying Media file',
    COMPANION_GENERAL_ERROR = 'General error from Companion Ad',   // code 5xx for Non-Linear ads
    COMPANION_SIZE_UNSUPPORTED = 'Companion creative size unsupported',
    COMPANION_UNABLE_TO_DISPLAY = 'Companion unable to display',
    COMPANION_UNABLE_TO_FETCH = 'Unable to fetch Companion resource',
    COMPANION_RESOURCE_NOT_FOUND = 'Supported Companion resource not found',
    UNDEFINED_ERROR = 'Undefined Error',
    GENERAL_VPAID_ERROR = 'General VPAID error'
}

export class VastErrorHandler {

    public static sendVastErrorEventWithThirdParty(vast: Vast, thirdPartyEventManager: ThirdPartyEventManager, sessionId: string, errorCode?: VastErrorCode, assetUrl?: string): Promise<INativeResponse> {
        const errorTrackingUrl = vast.getErrorURLTemplate();
        if (errorTrackingUrl) {
            return VastErrorHandler.sendErrorEventWithThirdParty(thirdPartyEventManager, sessionId, errorTrackingUrl, errorCode, assetUrl);
        }
        return Promise.reject();
    }

    public static sendVastErrorEventWithRequest(vast: Vast, request: Request, errorCode?: VastErrorCode, assetUrl?: string): Promise<INativeResponse> {
        const errorTrackingUrl = vast.getErrorURLTemplate();
        if (errorTrackingUrl) {
            return VastErrorHandler.sendErrorEventWithRequest(request, errorTrackingUrl, errorCode, assetUrl);
        }
        return Promise.reject();
    }

    private static sendErrorEventWithThirdParty(thirdPartyEventManager: ThirdPartyEventManager, sessionId: string, errorUrl: string, errorCode?: VastErrorCode, assetUrl?: string): Promise<INativeResponse> {
        if (!errorCode) {
            errorCode = VastErrorCode.UNDEFINED_ERROR;
        }
        const eventName = 'VAST error code ' + errorCode + ' tracking';
        const vastErrorUrl = VastErrorHandler.formatVASTErrorURL(errorUrl, errorCode, assetUrl);
        return thirdPartyEventManager.sendWithGet(eventName, sessionId, vastErrorUrl);
    }

    private static sendErrorEventWithRequest(request: Request, errorUrl: string, errorCode?: VastErrorCode, assetUrl?: string): Promise<INativeResponse> {
        if (!errorCode) {
            errorCode = VastErrorCode.UNDEFINED_ERROR;
        }
        const vastErrorUrl = VastErrorHandler.formatVASTErrorURL(errorUrl, errorCode, assetUrl);

        return request.get(vastErrorUrl, []);
    }

    private static formatVASTErrorURL(errorUrl: string, errorCode: VastErrorCode, assetUrl?: string): string {
        let formattedUrl = errorUrl.replace('[ERRORCODE]', errorCode.toString());
        if (assetUrl) {
            formattedUrl = formattedUrl.replace('[ASSETURI]', assetUrl);
        }
        return formattedUrl;
    }

}
