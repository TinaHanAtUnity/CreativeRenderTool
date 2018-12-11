import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Campaign } from 'Ads/Models/Campaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';

export interface IContentTypeHandler {
    parser: CampaignParser;
    factory: AbstractAdUnitFactory<Campaign, IAdUnitParameters<Campaign>>;
}

export type ContentTypeHandlerMapType = { [key: string]: IContentTypeHandler };

export abstract class AbstractParserModule {

    protected readonly _contentTypeHandlerMap: ContentTypeHandlerMapType;

    protected constructor(contentTypeHandlerMap: ContentTypeHandlerMapType) {
        this._contentTypeHandlerMap = contentTypeHandlerMap;
    }

    public getContentTypeHandlerMap(): ContentTypeHandlerMapType {
        return this._contentTypeHandlerMap;
    }

}
