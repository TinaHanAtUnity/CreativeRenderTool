import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { CampaignParser } from 'Ads/Parsers/CampaignParser';

export interface IParserModule {

    canParse(contentType: string): boolean;
    getParser(contentType: string): CampaignParser;
    getParsers(): CampaignParser[];
    getAdUnitFactory(): AbstractAdUnitFactory;

}
