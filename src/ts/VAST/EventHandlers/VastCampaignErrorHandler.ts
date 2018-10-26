import { Request, INativeResponse } from 'Core/Utilities/Request';
import { ICampaignErrorHandler } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CampaignError } from 'Ads/Errors/CampaignError';

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
    WRAPPER_DEPTH_LIMIT_REACHED = 302,
    WRAPPER_NO_ADS_FOUND = 303,
    LINEAR_UNABLE_TO_PLAY = 400,
    MEDIA_FILE_URL_NOT_FOUND = 401,
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
    GENERAL_VPAID_ERROR = 901,
    UNKNOWN_ERROR = 9999
}
export class VastErrorInfo {
    public static errorMap: { [key: number]: string } = {
        [VastErrorCode.XML_PARSER_ERROR] : 'VAST xml data is missing',
        [VastErrorCode.SCHEMA_VAL_ERROR]: 'VAST schema validation error',
        [VastErrorCode.VERSION_UNSUPPORTED]: 'VAST version Unsupported',
        [VastErrorCode.FORMAT_UNSUPPORTED]: 'VAST format unsupported',
        [VastErrorCode.DURATION_UNSUPPORTED]: 'VAST duration unsupported',
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
        // code 5xx for Non-Linear ads
        [VastErrorCode.COMPANION_GENERAL_ERROR]: 'General error from Companion Ad',
        [VastErrorCode.COMPANION_SIZE_UNSUPPORTED]: 'Companion creative size unsupported',
        [VastErrorCode.COMPANION_UNABLE_TO_DISPLAY]: 'Companion unable to displayg',
        [VastErrorCode.COMPANION_UNABLE_TO_FETCH]: 'Unable to fetch Companion resource',
        [VastErrorCode.COMPANION_RESOURCE_NOT_FOUND]: 'Supported Companion resource not found',
        [VastErrorCode.UNDEFINED_ERROR]: 'Undefined Error',
        [VastErrorCode.GENERAL_VPAID_ERROR]: 'General VPAID error',
        [VastErrorCode.UNKNOWN_ERROR]: 'Unknown Error'
    };
}

export class VastCampaignErrorHandler implements ICampaignErrorHandler {
    private _request: Request;
    private _nativeBridge: NativeBridge;

    constructor(nativeBridge: NativeBridge, request: Request) {
        this._request = request;
        this._nativeBridge = nativeBridge;
    }

    public handleCampaignError(campaignError: CampaignError): Promise<void> {
        if (campaignError.errorTrackingUrl) {
            const errorCode = campaignError.errorCode ? campaignError.errorCode : VastErrorCode.UNDEFINED_ERROR;
            const errorUrl = this.formatVASTErrorURL(campaignError.errorTrackingUrl, errorCode, campaignError.assetUrl);
            this._nativeBridge.Sdk.logInfo(`VAST Campaign Error tracking url: ${errorUrl} with errorCode: ${errorCode} errorMessage: ${campaignError.errorMessage}`);

            this._request.get(errorUrl, []).then(() => {
                return Promise.resolve();
            });
        }
        return Promise.reject(new Error('VastCampaignErrorHandler errorTrackingUrl was undefined'));
    }

    private formatVASTErrorURL(errorUrl: string, errorCode: VastErrorCode, assetUrl?: string): string {
        let formattedUrl = errorUrl.replace('[ERRORCODE]', errorCode.toString());
        if (assetUrl) {
            formattedUrl = formattedUrl.replace('[ASSETURI]', assetUrl);
        }
        return formattedUrl;
    }
}
