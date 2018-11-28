import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';

export interface IContentTypeHandler {
    parser: CampaignParser;
    factory: AbstractAdUnitFactory;
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
