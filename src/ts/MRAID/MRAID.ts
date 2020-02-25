import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';
import { ARUtil } from 'AR/Utilities/ARUtil';

export class MRAID extends AbstractParserModule {

    constructor(ar: IARApi, core: ICore, ads: IAds) {
        const hasArPlacement = ARUtil.hasArPlacement(ads);

        const paramsFactory = new MRAIDAdUnitParametersFactory(ar, core, ads, hasArPlacement);
        const contentTypeHandlerMap: { [key: string]: IContentTypeHandler } = {};
        const factory = new MRAIDAdUnitFactory(paramsFactory);

        contentTypeHandlerMap[ProgrammaticMraidParser.ContentType] = {
            parser: new ProgrammaticMraidParser(core.NativeBridge.getPlatform()),
            factory
        };
        contentTypeHandlerMap[ProgrammaticMraidUrlParser.ContentType] = {
            parser: new ProgrammaticMraidUrlParser(core.NativeBridge.getPlatform()),
            factory
        };
        super(contentTypeHandlerMap);
    }

}
