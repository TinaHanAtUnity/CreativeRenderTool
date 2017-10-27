import { AuctionResponse } from 'Models/AuctionResponse';
import { Session } from 'Models/Session';
import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { Platform } from 'Constants/Platform';

export abstract class CampaignParser {
    public abstract parse(nativeBridge: NativeBridge, request: Request, response: AuctionResponse, session: Session, gamerId: string, abGroup: number): Promise<Campaign>;

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
}
