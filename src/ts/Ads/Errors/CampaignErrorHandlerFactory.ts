import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request } from 'Core/Utilities/Request';
import { VastCampaignErrorHandler } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignError } from 'Ads/Errors/CampaignError';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { DefaultCampaignErrorHandler } from 'Ads/Errors/DefaultCampaignErrorHandler';

export interface ICampaignErrorHandler {
    handleCampaignError(campaignError: CampaignError): Promise<void>;
}

export class CampaignErrorHandlerFactory {
    public static getCampaignErrorHandler(contentType: string, nativeBridge: NativeBridge, request: Request): ICampaignErrorHandler {
        switch(contentType) {
            case CampaignContentTypes.ProgrammaticVast:
                return new VastCampaignErrorHandler(nativeBridge, request);
            default:
                return new DefaultCampaignErrorHandler();
        }
    }
}
