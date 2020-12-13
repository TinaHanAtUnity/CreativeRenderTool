import { SessionDiagnostics } from 'Ads/Utilities/SessionDiagnostics';
import { Platform } from 'Core/Constants/Platform';
import { Url } from 'Core/Utilities/Url';
export class CampaignParser {
    constructor(platform) {
        this._platform = platform;
    }
    setCreativeIdentification(response) {
        this.creativeID = response.getCreativeId() || undefined;
        this.seatID = response.getSeatId() || undefined;
        this.campaignID = response.getAdvertiserCampaignId() || this.getProgrammaticCampaignId();
    }
    getProgrammaticCampaignId() {
        if (!this._programmaticCampaignId) {
            let campaignId;
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
    validateAndEncodeUrl(url, session) {
        if (Url.isValid(url)) {
            return Url.encode(url);
        }
        SessionDiagnostics.trigger('invalid_url', {
            url: url
        }, session);
        throw new Error('Invalid url: ' + url);
    }
    validateAndEncodeUrls(urls, session) {
        const newUrls = [];
        if (urls && urls.length > 0) {
            for (const url of urls) {
                newUrls.push(this.validateAndEncodeUrl(url, session));
            }
        }
        return newUrls;
    }
    validateAndEncodeTrackingUrls(urls, session) {
        if (urls && urls !== null) {
            for (const urlKey in urls) {
                if (urls.hasOwnProperty(urlKey)) {
                    const urlArray = urls[urlKey];
                    const newUrlArray = [];
                    for (const url of urlArray) {
                        newUrlArray.push(this.validateAndEncodeUrl(url, session));
                    }
                    urls[urlKey] = newUrlArray;
                }
            }
        }
        return urls;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25QYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1BhcnNlcnMvQ2FtcGFpZ25QYXJzZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFDdEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUV6QyxNQUFNLE9BQWdCLGNBQWM7SUFTaEMsWUFBWSxRQUFrQjtRQUMxQixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM5QixDQUFDO0lBSU0seUJBQXlCLENBQUMsUUFBeUI7UUFDdEQsSUFBSSxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLElBQUksU0FBUyxDQUFDO1FBQ3hELElBQUksQ0FBQyxNQUFNLEdBQUcsUUFBUSxDQUFDLFNBQVMsRUFBRSxJQUFJLFNBQVMsQ0FBQztRQUNoRCxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLElBQUksQ0FBQyx5QkFBeUIsRUFBRSxDQUFDO0lBQzdGLENBQUM7SUFFUyx5QkFBeUI7UUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUMvQixJQUFJLFVBQWtCLENBQUM7WUFDdkIsUUFBUSxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNwQixLQUFLLFFBQVEsQ0FBQyxHQUFHO29CQUNiLFVBQVUsR0FBRywwQkFBMEIsQ0FBQztvQkFDeEMsTUFBTTtnQkFDVixLQUFLLFFBQVEsQ0FBQyxPQUFPO29CQUNqQixVQUFVLEdBQUcsMEJBQTBCLENBQUM7b0JBQ3hDLE1BQU07Z0JBQ1Y7b0JBQ0ksVUFBVSxHQUFHLFNBQVMsQ0FBQzthQUM5QjtZQUNELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxVQUFVLENBQUM7U0FDN0M7UUFDRCxPQUFPLElBQUksQ0FBQyx1QkFBdUIsQ0FBQztJQUN4QyxDQUFDO0lBRVMsb0JBQW9CLENBQUMsR0FBVyxFQUFFLE9BQWdCO1FBQ3hELElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNsQixPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDMUI7UUFFRCxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFO1lBQ3RDLEdBQUcsRUFBRSxHQUFHO1NBQ1gsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVaLE1BQU0sSUFBSSxLQUFLLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFUyxxQkFBcUIsQ0FBQyxJQUFjLEVBQUUsT0FBZ0I7UUFDNUQsTUFBTSxPQUFPLEdBQWEsRUFBRSxDQUFDO1FBQzdCLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3pCLEtBQUssTUFBTSxHQUFHLElBQUksSUFBSSxFQUFFO2dCQUNwQixPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQzthQUN6RDtTQUNKO1FBQ0QsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVTLDZCQUE2QixDQUFDLElBQXVDLEVBQUUsT0FBZ0I7UUFDN0YsSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLElBQUksRUFBRTtZQUN2QixLQUFLLE1BQU0sTUFBTSxJQUFJLElBQUksRUFBRTtnQkFDdkIsSUFBSSxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxFQUFFO29CQUM3QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzlCLE1BQU0sV0FBVyxHQUFhLEVBQUUsQ0FBQztvQkFFakMsS0FBSyxNQUFNLEdBQUcsSUFBSSxRQUFRLEVBQUU7d0JBQ3hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO3FCQUM3RDtvQkFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsV0FBVyxDQUFDO2lCQUM5QjthQUNKO1NBQ0o7UUFFRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0oifQ==