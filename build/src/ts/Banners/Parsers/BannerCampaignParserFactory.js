import { BannerCampaignParser } from 'Banners/Parsers/BannerCampaignParser';
export class BannerCampaignParserFactory {
    static getCampaignParser(platform, contentType) {
        switch (contentType) {
            case BannerCampaignParser.ContentTypeJS:
                return new BannerCampaignParser(platform, true);
            case BannerCampaignParser.ContentTypeHTML:
                return new BannerCampaignParser(platform);
            default:
                throw new Error(`Unsupported content-type: ${contentType}`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmFubmVyQ2FtcGFpZ25QYXJzZXJGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Jhbm5lcnMvUGFyc2Vycy9CYW5uZXJDYW1wYWlnblBhcnNlckZhY3RvcnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0sc0NBQXNDLENBQUM7QUFHNUUsTUFBTSxPQUFPLDJCQUEyQjtJQUM3QixNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBa0IsRUFBRSxXQUFtQjtRQUNuRSxRQUFRLFdBQVcsRUFBRTtZQUNqQixLQUFLLG9CQUFvQixDQUFDLGFBQWE7Z0JBQ25DLE9BQU8sSUFBSSxvQkFBb0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDcEQsS0FBSyxvQkFBb0IsQ0FBQyxlQUFlO2dCQUNyQyxPQUFPLElBQUksb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDOUM7Z0JBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyw2QkFBNkIsV0FBVyxFQUFFLENBQUMsQ0FBQztTQUNuRTtJQUNMLENBQUM7Q0FDSiJ9