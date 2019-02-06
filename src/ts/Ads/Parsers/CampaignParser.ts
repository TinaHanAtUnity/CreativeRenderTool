import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Url } from 'Core/Utilities/Url';

export abstract class CampaignParser {

    public creativeID: string | undefined;
    public seatID: number | undefined;

    protected _platform: Platform;
    private _programmaticCampaignId: string;

    constructor(platform: Platform) {
        this._platform = platform;
    }

    public abstract parse(response: AuctionResponse, session: Session): Promise<Campaign>;

    public setCreativeIdentification(response: AuctionResponse) {
        this.creativeID = response.getCreativeId() || undefined;
        this.seatID = response.getSeatId() || undefined;
    }

    protected getProgrammaticCampaignId(): string {
        if (!this._programmaticCampaignId) {
            let campaignId: string;
            switch (this._platform) {
                case Platform.IOS:
                    campaignId = '00005472656d6f7220694f53';
                    break;
                case Platform.ANDROID:
                    campaignId = '005472656d6f7220416e6472';
                    break;
                default:
                    campaignId = 'UNKNOWN';
            }
            this._programmaticCampaignId = campaignId;
        }
        return this._programmaticCampaignId;
    }

    protected validateAndEncodeUrl(url: string, session: Session): string {
        if(Url.isValid(url)) {
            return Url.encode(url);
        }

        SessionDiagnostics.trigger('invalid_url', {
            url: url
        }, session);

        throw new Error('Invalid url: ' + url);
    }

    protected validateAndEncodeUrls(urls: string[], session: Session): string[] {
        const newUrls: string[] = [];
        if (urls && urls.length > 0) {
            for (const url of urls) {
                newUrls.push(this.validateAndEncodeUrl(url, session));
            }
        }
        return newUrls;
    }

    protected validateAndEncodeTrackingUrls(urls: { [eventName: string]: string[] }, session: Session): { [eventName: string]: string[] } {
        if(urls && urls !== null) {
            for(const urlKey in urls) {
                if(urls.hasOwnProperty(urlKey)) {
                    const urlArray = urls[urlKey];
                    const newUrlArray: string[] = [];

                    for(const url of urlArray) {
                        newUrlArray.push(this.validateAndEncodeUrl(url, session));
                    }

                    urls[urlKey] = newUrlArray;
                }
            }
        }

        return urls;
    }
}
