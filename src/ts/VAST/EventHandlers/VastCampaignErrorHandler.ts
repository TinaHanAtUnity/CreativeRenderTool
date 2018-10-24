import { Request, INativeResponse } from 'Core/Utilities/Request';
import { ICampaignErrorHandler } from 'Ads/Errors/CampaignErrorHandlerFactory';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { VastErrorCode } from 'VAST/EventHandlers/VastErrorHandler';

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
        [VastErrorCode.WRAPPER_LIMIT_REACHED]: 'Wrapper depth exceeded',
        [VastErrorCode.WRAPPER_NO_ADS_FOUND]: 'No ads found in Wrapper response',
        [VastErrorCode.LINEAR_UNABLE_TO_PLAY]: 'General error from Linear Ad',
        [VastErrorCode.MEDIA_FILE_NOT_FOUND]: 'No video URL found for VAST',
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

    public sendErrorEventWithRequest(campaignError: CampaignError): Promise<INativeResponse> {
        if (campaignError.errorTrackingUrl) {
            const errorCode = campaignError.errorCode ? campaignError.errorCode : VastErrorCode.UNDEFINED_ERROR;
            const errorUrl = this.formatVASTErrorURL(campaignError.errorTrackingUrl, errorCode, campaignError.assetUrl);
            this._nativeBridge.Sdk.logInfo(`VAST Campaign Error tracking url: ${errorUrl} with errorCode: ${errorCode} errorMessage: ${campaignError.errorMessage}`);

            return this._request.get(errorUrl, []);
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
