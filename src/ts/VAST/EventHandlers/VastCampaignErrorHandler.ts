import { ICampaignErrorHandler } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';
import { Diagnostics } from 'Core/Utilities/Diagnostics';

/**
 * VAST Error code defined in 3.0
 * https://wiki.iabtechlab.com/index.php?title=VAST_Error_Code_Troubleshooting_Matrix
 * https://iabtechlab.com/wp-content/uploads/2018/11/VAST4.1-final-Nov-8-2018.pdf   Page 28 for error codes
 */
export enum VastErrorCode {
    XML_PARSER_ERROR = 100,
    SCHEMA_VAL_ERROR = 101,
    VERSION_UNSUPPORTED = 102,
    FORMAT_UNSUPPORTED = 200,
    DURATION_UNSUPPORTED = 202,
    SIZE_UNSUPPORTED = 203,
    WRAPPER_GENERAL_ERROR = 300,
    WRAPPER_URI_TIMEOUT = 301,
    WRAPPER_DEPTH_LIMIT_REACHED = 302,
    WRAPPER_NO_ADS_FOUND = 303,
    LINEAR_UNABLE_TO_PLAY = 400,
    MEDIA_FILE_URL_NOT_FOUND = 401,
    MEDIA_FILE_TIMEOUT = 402,
    MEDIA_FILE_UNSUPPORTED = 403,
    MEDIA_FILE_UNSUPPORTED_IOS = 404,
    MEDIA_FILE_PLAY_ERROR = 405,
    MEDIA_FILE_NO_CLICKTHROUGH_URL = 499,
    COMPANION_GENERAL_ERROR = 600,   // code 5xx for Non-Linear ads
    COMPANION_SIZE_UNSUPPORTED = 601,
    COMPANION_UNABLE_TO_DISPLAY = 602,
    COMPANION_UNABLE_TO_FETCH = 603,
    COMPANION_RESOURCE_NOT_FOUND = 604,
    COMPANION_NO_CLICKTHROUGH = 699,
    UNDEFINED_ERROR = 900,
    GENERAL_VPAID_ERROR = 901,
    INVALID_URL_ERROR = 998,
    UNKNOWN_ERROR = 999
}
export class VastErrorInfo {
    public static errorMap: { [key: number]: string } = {
        [VastErrorCode.XML_PARSER_ERROR] : 'VAST xml data is missing',
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
}

export class VastCampaignErrorHandler implements ICampaignErrorHandler {
    private _core: ICoreApi;
    private _request: RequestManager;

    constructor(core: ICoreApi, request: RequestManager) {
        this._request = request;
        this._core = core;
    }

    public handleCampaignError(campaignError: CampaignError): Promise<void> {
        const errorList: CampaignError[] = [];
        errorList.push(campaignError);
        while (errorList.length > 0) {
            const oneError = errorList.shift();
            if (oneError) {
                for (const subError of oneError.getSubCampaignErrors()) {
                    errorList.push(subError);
                }

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
        }
        return Promise.resolve();
    }

    private formatVASTErrorURL(errorUrl: string, errorCode: VastErrorCode, assetUrl?: string): string {
        let formattedUrl = errorUrl.replace(/\[ERRORCODE\]|%5BERRORCODE%5D/ig, errorCode.toString());
        if (assetUrl) {
            formattedUrl = formattedUrl.replace(/\[ASSETURI\]|%5BASSETURI%5D/ig, Url.encodeParam(assetUrl));
        }
        return formattedUrl;
    }
}
