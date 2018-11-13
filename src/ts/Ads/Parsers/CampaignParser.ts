import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Campaign } from 'Ads/Models/Campaign';
import { Session } from 'Ads/Models/Session';
import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { Request } from 'Core/Utilities/Request';
import { Url } from 'Core/Utilities/Url';

export abstract class CampaignParser {
    public abstract parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, osVersion?: string, gameId?: string, connectionType?: string): Promise<Campaign>;

    protected _creativeID: string | undefined;
    protected _seatID: number | undefined;

    public alertCreativeService(parseError: any) {
        if (this._creativeID && this._seatID) {
                const kafkaObject: any = {};
                kafkaObject.type = 'parse_error';
                kafkaObject.creativeId = this._creativeID;
                kafkaObject.seatId = this._seatID;
                if (parseError.errorCode && parseError.message) {
                    kafkaObject.errorCode = parseError.errorCode;
                    kafkaObject.message = parseError.message;
                }
                HttpKafka.sendEvent('ads.creative.blocking', KafkaCommonObjectType.EMPTY, kafkaObject);
        }
    }

    protected setIds(response: AuctionResponse) {
        this._creativeID = response.getCreativeId() || undefined;
        this._seatID = response.getSeatId() || undefined;
    }

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
