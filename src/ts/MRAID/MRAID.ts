import { AbstractParserModule, IContentTypeHandler } from 'Ads/Modules/AbstractParserModule';
import { MRAIDAdUnitFactory } from 'MRAID/AdUnits/MRAIDAdUnitFactory';
import { ProgrammaticMraidParser } from 'MRAID/Parsers/ProgrammaticMraidParser';
import { ProgrammaticMraidUrlParser } from 'MRAID/Parsers/ProgrammaticMraidUrlParser';
import { MRAIDAdUnitParametersFactory } from 'MRAID/AdUnits/MRAIDAdUnitParametersFactory';
import { IARApi } from 'AR/AR';
import { ICore } from 'Core/ICore';
import { IAds } from 'Ads/IAds';

export class MRAID extends AbstractParserModule {

    constructor(ar: IARApi, core: ICore, ads: IAds) {
        const supportArAds = Object.values(ads.Config.getPlacements() || {})
            .some(placement => {
                    return (placement.getAdTypes() || [])
                        .some(adType => {
                            return adType === 'MRAID_AR';
                        });
                }
            );

        const paramsFactory = new MRAIDAdUnitParametersFactory(ar, core, ads, supportArAds);
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
