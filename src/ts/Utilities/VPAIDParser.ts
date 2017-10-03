import { VastParser } from "Utilities/VastParser";
import { VPAID } from "Models/VPAID/VPAID";
import { Vast } from "Models/Vast/Vast";
import { VastMediaFile } from "Models/Vast/VastMediaFile";

const VPAIDApiFramework = 'VPAID';
const VPAIDJavascriptType = 'application/javascript';

export class VPAIDParser {
    private vastParser: VastParser = new VastParser();

    public parse(dom: string): VPAID {
        const vast = this.vastParser.parseVast(dom);
        return this.parseFromVast(vast);
    }

    public parseFromVast(vast: Vast): VPAID {
        const mediaFile = this.getSupportedMediaFile(vast);
        if (mediaFile) {
            return new VPAID(mediaFile, vast);
        } else {
            throw new Error('VAST object does not contain a VPAID MediaFile');
        }
    }

    public checkVASTSupportsVPAID(vast: Vast): boolean {
        return !!this.getSupportedMediaFile(vast);
    }

    private getSupportedMediaFile(vast: Vast): VastMediaFile | null {
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
