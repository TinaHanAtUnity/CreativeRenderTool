import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';

export interface IParserModule {
    getParsers(): CampaignParser[];
    getAdUnitFactories(): { [key: string]: AbstractAdUnitFactory };
}

export abstract class AbstractParserModule implements IParserModule {

    protected readonly _parsers: CampaignParser[];
    protected readonly _factories: { [key: string]: AbstractAdUnitFactory };

    protected constructor(parsers: CampaignParser[], factories: { [key: string]: AbstractAdUnitFactory }) {
        this._parsers = parsers;
        this._factories = factories;
    }

    public getParsers(): CampaignParser[] {
        const parsers = [];
        for(const contentType in this._contentTypeHandlerMap) {
            if(this._contentTypeHandlerMap.hasOwnProperty(contentType)) {
                parsers.push(this._contentTypeHandlerMap[contentType].parser);
            }
        }
        return parsers;
    }

}
