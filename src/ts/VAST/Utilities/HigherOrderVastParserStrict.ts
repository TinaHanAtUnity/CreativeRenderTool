import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { Vast } from 'VAST/Models/Vast';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';

export class HigherOrderVastParserStrict {

    private _isPublicaResponse: boolean;
    private _vastParserStrict: VastParserStrict;

    constructor(vastParserStrict: VastParserStrict) {
        this._isPublicaResponse = false;
        this._vastParserStrict = vastParserStrict;
    }

    public retrieveVast(vast: string, core: ICoreApi, request: RequestManager, bundleId?: string, parent?: Vast, depth: number = 0, urlProtocol: string = 'https:'): Promise<Vast> {
        let parsedVast: Vast;

        try {
            parsedVast = this._vastParserStrict.parseVast(vast, urlProtocol);
        } catch (campaignError) {
            const errorData: {} = {
                vast: vast,
                wrapperDepth: depth,
                rootWrapperVast: depth === 0 ? vast : ''
            };
            campaignError.errorData = errorData;

            throw campaignError;
        }

        this._vastParserStrict.applyParentURLs(parsedVast, parent);

        const wrapperURL = parsedVast.getWrapperURL();
        if (wrapperURL) {
            if (CustomFeatures.isIASVastTag(wrapperURL)) {
                this._isPublicaResponse = true;
            }
        }

        parsedVast.setIsPublicaTag(this._isPublicaResponse);
        return this._vastParserStrict.retrieveVast(vast, core, request, bundleId, parsedVast, depth, urlProtocol);
    }
}
