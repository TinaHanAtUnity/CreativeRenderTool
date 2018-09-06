import { Vast } from 'VAST/Models/Vast';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastParser } from 'VAST/Utilities/VastParser';
import { VPAID } from 'VPAID/Models/VPAID';

const VPAIDApiFramework = 'VPAID';
const VPAIDJavascriptType = 'application/javascript';

export class VPAIDParser {
    private vastParser: VastParser = new VastParser();

    public parse(dom: string): VPAID {
        const vast = this.vastParser.parseVast(dom);
        const mediaFile = this.getSupportedMediaFile(vast);
        if (mediaFile) {
            return this.parseFromVast(vast, mediaFile);
        } else {
            throw new Error('VPAID does not contain a supported media file');
        }
    }

    public parseFromVast(vast: Vast, mediaFile: VastMediaFile): VPAID {
        return new VPAID(mediaFile, vast);
    }

    public getSupportedMediaFile(vast: Vast): VastMediaFile | null {
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

    private supportsVPAID(mediaFile: VastMediaFile): boolean {
        return mediaFile.getApiFramework() === VPAIDApiFramework;
    }

    private isJavascriptTyped(mediaFile: VastMediaFile): boolean {
        return mediaFile.getMIMEType() === VPAIDJavascriptType;
    }
}
