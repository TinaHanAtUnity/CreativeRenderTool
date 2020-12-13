import { VPAID } from 'VPAID/Models/VPAID';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
const VPAIDApiFramework = 'VPAID';
const VPAIDJavascriptType = 'application/javascript';
export class VPAIDParser {
    constructor() {
        this._vastParser = new VastParserStrict();
    }
    parse(dom) {
        const vast = this._vastParser.parseVast(dom);
        const mediaFile = this.getSupportedMediaFile(vast);
        if (mediaFile) {
            return this.parseFromVast(vast, mediaFile);
        }
        else {
            throw new Error('VPAID does not contain a supported media file');
        }
    }
    parseFromVast(vast, mediaFile) {
        return new VPAID(mediaFile, vast);
    }
    getSupportedMediaFile(vast) {
        const ad = vast.getAd();
        if (ad) {
            for (const creative of ad.getCreatives()) {
                for (const mediaFile of creative.getMediaFiles()) {
                    if (this.supportsVPAID(mediaFile) && this.isJavascriptTyped(mediaFile)) {
                        return mediaFile;
                    }
                }
            }
        }
        return null;
    }
    supportsVPAID(mediaFile) {
        return mediaFile.getApiFramework() === VPAIDApiFramework;
    }
    isJavascriptTyped(mediaFile) {
        return mediaFile.getMIMEType() === VPAIDJavascriptType;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURQYXJzZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvVXRpbGl0aWVzL1ZQQUlEUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVuRSxNQUFNLGlCQUFpQixHQUFHLE9BQU8sQ0FBQztBQUNsQyxNQUFNLG1CQUFtQixHQUFHLHdCQUF3QixDQUFDO0FBRXJELE1BQU0sT0FBTyxXQUFXO0lBR3BCO1FBQ0ksSUFBSSxDQUFDLFdBQVcsR0FBRyxJQUFJLGdCQUFnQixFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUVNLEtBQUssQ0FBQyxHQUFXO1FBQ3BCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzdDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuRCxJQUFJLFNBQVMsRUFBRTtZQUNYLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDOUM7YUFBTTtZQUNILE1BQU0sSUFBSSxLQUFLLENBQUMsK0NBQStDLENBQUMsQ0FBQztTQUNwRTtJQUNMLENBQUM7SUFFTSxhQUFhLENBQUMsSUFBVSxFQUFFLFNBQXdCO1FBQ3JELE9BQU8sSUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxxQkFBcUIsQ0FBQyxJQUFVO1FBQ25DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixJQUFJLEVBQUUsRUFBRTtZQUNKLEtBQUssTUFBTSxRQUFRLElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFO2dCQUN0QyxLQUFLLE1BQU0sU0FBUyxJQUFJLFFBQVEsQ0FBQyxhQUFhLEVBQUUsRUFBRTtvQkFDOUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsRUFBRTt3QkFDcEUsT0FBTyxTQUFTLENBQUM7cUJBQ3BCO2lCQUNKO2FBQ0o7U0FDSjtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTyxhQUFhLENBQUMsU0FBd0I7UUFDMUMsT0FBTyxTQUFTLENBQUMsZUFBZSxFQUFFLEtBQUssaUJBQWlCLENBQUM7SUFDN0QsQ0FBQztJQUVPLGlCQUFpQixDQUFDLFNBQXdCO1FBQzlDLE9BQU8sU0FBUyxDQUFDLFdBQVcsRUFBRSxLQUFLLG1CQUFtQixDQUFDO0lBQzNELENBQUM7Q0FDSiJ9