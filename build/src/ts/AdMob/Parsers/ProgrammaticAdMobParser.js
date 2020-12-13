import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
export class ProgrammaticAdMobParser extends CampaignParser {
    constructor(core) {
        super(core.NativeBridge.getPlatform());
    }
    parse(response, session) {
        const markup = response.getContent();
        const cacheTTL = response.getCacheTTL();
        const isOpenMeasurementEnabled = response.isAdmobOMEnabled();
        const shouldMuteByDefault = response.shouldMuteByDefault();
        const baseCampaignParams = {
            id: this.getProgrammaticCampaignId(),
            willExpireAt: cacheTTL ? Date.now() + cacheTTL * 1000 : undefined,
            contentType: ProgrammaticAdMobParser.ContentType,
            adType: response.getAdType() || undefined,
            correlationId: response.getCorrelationId() || undefined,
            creativeId: response.getCreativeId() || undefined,
            seatId: response.getSeatId() || undefined,
            meta: undefined,
            session: session,
            mediaId: response.getMediaId(),
            trackingUrls: response.getTrackingUrls() || {},
            isLoadEnabled: false
        };
        const adMobCampaignParams = Object.assign({}, baseCampaignParams, { dynamicMarkup: markup, useWebViewUserAgentForTracking: true, omVendors: [], isOMEnabled: isOpenMeasurementEnabled, shouldMuteByDefault: shouldMuteByDefault });
        return Promise.resolve(new AdMobCampaign(adMobCampaignParams));
    }
}
ProgrammaticAdMobParser.ContentType = 'programmatic/admob-video';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljQWRNb2JQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRNb2IvUGFyc2Vycy9Qcm9ncmFtbWF0aWNBZE1vYlBhcnNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsYUFBYSxFQUFrQixNQUFNLDRCQUE0QixDQUFDO0FBSTNFLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUc1RCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsY0FBYztJQUl2RCxZQUFZLElBQVc7UUFDbkIsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQXlCLEVBQUUsT0FBZ0I7UUFDcEQsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ3JDLE1BQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN4QyxNQUFNLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1FBQzdELE1BQU0sbUJBQW1CLEdBQUcsUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFDM0QsTUFBTSxrQkFBa0IsR0FBYztZQUNsQyxFQUFFLEVBQUUsSUFBSSxDQUFDLHlCQUF5QixFQUFFO1lBQ3BDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxTQUFTO1lBQ2pFLFdBQVcsRUFBRSx1QkFBdUIsQ0FBQyxXQUFXO1lBQ2hELE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLElBQUksU0FBUztZQUN6QyxhQUFhLEVBQUUsUUFBUSxDQUFDLGdCQUFnQixFQUFFLElBQUksU0FBUztZQUN2RCxVQUFVLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRSxJQUFJLFNBQVM7WUFDakQsTUFBTSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxTQUFTO1lBQ3pDLElBQUksRUFBRSxTQUFTO1lBQ2YsT0FBTyxFQUFFLE9BQU87WUFDaEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEVBQUU7WUFDOUIsWUFBWSxFQUFFLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFO1lBQzlDLGFBQWEsRUFBRSxLQUFLO1NBQ3ZCLENBQUM7UUFFRixNQUFNLG1CQUFtQixxQkFDbEIsa0JBQWtCLElBQ3JCLGFBQWEsRUFBRSxNQUFNLEVBQ3JCLDhCQUE4QixFQUFFLElBQUksRUFDcEMsU0FBUyxFQUFFLEVBQUUsRUFDYixXQUFXLEVBQUUsd0JBQXdCLEVBQ3JDLG1CQUFtQixFQUFFLG1CQUFtQixHQUMzQyxDQUFDO1FBRUYsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDOztBQXBDYSxtQ0FBVyxHQUFHLDBCQUEwQixDQUFDIn0=