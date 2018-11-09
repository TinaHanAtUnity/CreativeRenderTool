import { CampaignParser } from 'Ads/Parsers/CampaignParser';
import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';

export class ContentTypeHandlerManager {

    private _parsers: { [key: string]: CampaignParser } = {};
    private _factories: { [key: string]: AbstractAdUnitFactory } = {};

    public addParser(contentType: string, parser: CampaignParser) {
        if(!(contentType in this._parsers)) {
            this._parsers[contentType] = parser;
        } else {
            throw new Error('Parser already defined for: ' + contentType);
        }
    }

    public addFactory(contentType: string, factory: AbstractAdUnitFactory) {
        if(!(contentType in this._factories)) {
            this._factories[contentType] = factory;
        } else {
            throw new Error('AdUnitFactory already defined for: ' + contentType);
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
