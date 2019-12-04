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

    public retrieveVast(vast: string, core: ICoreApi, request: RequestManager, bundleId?: string, parent?: Vast, depth: number = 0, urlProtocol: string = 'https:'): Promise<Vast> {
        const isPublica = this.checkIsPublica(vast, depth, urlProtocol);
        return this._vastParserStrict.retrieveVast(vast, core, request, bundleId, parent, depth, urlProtocol, isPublica);
    }

    private checkIsPublica(vast: string, depth: number = 0, urlProtocol: string = 'https:') {
        let parsedVast: Vast;
        let isPublicaResponse = false;

        try {
            parsedVast = this._vastParserStrict.parseVast(vast, urlProtocol);
        } catch (campaignError) {
            const errorData: {} = {
                vast: vast,
                wrapperDepth: 0,
                rootWrapperVast: depth === 0 ? vast : ''
            };
            campaignError.errorData = errorData;

            throw campaignError;
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
