import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Request, INativeResponse } from 'Core/Utilities/Request';
import { VastCampaignErrorHandler } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { CampaignError } from 'Ads/Errors/CampaignError';

export interface ICampaignErrorHandler {
    sendErrorEventWithRequest(campaignError: CampaignError): Promise<INativeResponse>;
}

export class CampaignErrorHandlerFactory {
    public static getCampaignErrorHandler(contentType: string, nativeBridge: NativeBridge, request: Request): ICampaignErrorHandler | null {
        switch(contentType) {
            case ProgrammaticVastParser.ContentType:
                return new VastCampaignErrorHandler(nativeBridge, request);
            default:
                return null;
        }
    }
}
