import { CampaignParser } from '../Parsers/CampaignParser';
import { AbstractAdUnitFactory } from '../AdUnits/AbstractAdUnitFactory';

export interface IParserModule {

    canParse(contentType: string): boolean;
    getParser(contentType: string): CampaignParser;
    getParsers(): CampaignParser[];
    getAdUnitFactory(): AbstractAdUnitFactory;

}
