import { CampaignParseError } from 'Ads/Utilities/ProgrammaticTrackingService';

export class ContentType {

    private static errorMap: { [key: string]: CampaignParseError } = {};

    public static initializeContentMapping(contentTypes: string[]) {
        contentTypes.forEach(contentType => {
            const parseError = `parse_campaign_${contentType.replace(/[\/-]/g, '_')}_error`;
            const isValidContentType = contentTypes.includes(contentType);
            const hasValidCampaignParseError = Object.values(CampaignParseError).includes(parseError);
            if (isValidContentType && hasValidCampaignParseError) {
                this.errorMap[contentType] = <CampaignParseError>parseError;
            }
        });
    }

    public static getCampaignParseError(contentType: string): CampaignParseError {
        return this.errorMap[contentType] || CampaignParseError.UnknownParseError;
    }
}
