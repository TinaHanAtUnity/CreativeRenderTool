import { AdMobAdUnitFactory } from 'AdMob/AdUnits/AdMobAdUnitFactory';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';

export class AdMob extends AbstractParserModule {

    constructor() {
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        contentTypeHandlerMap[ProgrammaticAdMobParser.ContentType] = {
            parser: new ProgrammaticAdMobParser(),
            factory: new AdMobAdUnitFactory()
        };
        super(contentTypeHandlerMap);
    }

}
