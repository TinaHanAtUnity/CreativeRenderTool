import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { Campaign } from 'Ads/Models/Campaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';

export interface IContentTypeHandler {
    parser: CampaignParser;
    factory: AbstractAdUnitFactory<Campaign, IAdUnitParameters<Campaign>>;
}

export interface IContentTypeHandlerMapType { 
    [key: string]: IContentTypeHandler;
};

export abstract class AbstractParserModule {

    protected readonly _contentTypeHandlerMap: IContentTypeHandlerMapType;

    protected constructor(contentTypeHandlerMap: IContentTypeHandlerMapType) {
        this._contentTypeHandlerMap = contentTypeHandlerMap;
    }

    public getContentTypeHandlerMap(): IContentTypeHandlerMapType {
        return this._contentTypeHandlerMap;
    }

}
