import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Request } from 'Core/Managers/Request';
import { Url } from 'Core/Utilities/Url';

export abstract class CampaignParser {
    public abstract parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, osVersion?: string, gameId?: string): Promise<Campaign>;

    protected getProgrammaticCampaignId(nativeBridge: NativeBridge): string {
        switch (nativeBridge.getPlatform()) {
            case Platform.IOS:
                return '00005472656d6f7220694f53';
            case Platform.ANDROID:
                return '005472656d6f7220416e6472';
            default:
                return 'UNKNOWN';
        }
    }

    protected validateAndEncodeUrl(url: string, session: Session): string {
        if(Url.isValid(url)) {
            return Url.encode(url);
        }

        Diagnostics.trigger('invalid_url', {
            url: url
        });

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
