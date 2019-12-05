import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class PublicaCheckingVastParser {

    private _vastParserStrict: VastParserStrict;

    constructor(vastParserStrict: VastParserStrict) {
        this._vastParserStrict = vastParserStrict;
    }

    public checkIsPublica(vast: string, depth: number = 0, urlProtocol: string = 'https:') {
        let parsedVast: Vast;
        let isPublicaResponse = false;

        try {
            parsedVast = this._vastParserStrict.parseVast(vast, urlProtocol);
        } catch (campaignError) {
            return false;
        }

        const wrapperURL = parsedVast.getWrapperURL();
        if (wrapperURL) {
            if (CustomFeatures.isIASVastTag(wrapperURL)) {
                isPublicaResponse = true;
            }
        }

        return isPublicaResponse;
    }
}
