import { CampaignParser } from 'Ads/Parsers/CampaignParser';

export class CampaignParserManager {

    private _parsers: { [key: string]: CampaignParser };

    public addParsers(parsers: CampaignParser[]) {
        parsers.forEach(parser => this.addParser(parser));
    }

    public addParser(parser: CampaignParser) {
        const contentTypes = parser.getContentTypes();
        contentTypes.forEach(contentType => {
            if(!(contentType in this._parsers)) {
                this._parsers[contentType] = parser;
            }
            throw new Error('Parser already defined for: ' + contentType);
        });
    }

    public getCampaignParser(contentType: string): CampaignParser {
        if(contentType in this._parsers) {
            return this._parsers[contentType];
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
}
