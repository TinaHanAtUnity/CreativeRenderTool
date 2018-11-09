import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';

export class ContentTypeHandlerManager {

    private _parsers: { [key: string]: CampaignParser } = {};
    private _factories: { [key: string]: AbstractAdUnitFactory } = {};

    public addHandler(contentType: string, handler: IContentTypeHandler) {
        if(!(contentType in this._parsers) && !(contentType in this._factories)) {
            this._parsers[contentType] = handler.parser;
            this._factories[contentType] = handler.factory;
        } else {
            throw new Error('Handler already defined for content-type: ' + contentType);
        }
    }

    public getParser(contentType: string): CampaignParser {
        if(contentType in this._parsers) {
            return this._parsers[contentType];
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }

    public getFactory(contentType: string): AbstractAdUnitFactory {
        if(contentType in this._factories) {
            return this._factories[contentType];
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }

}
