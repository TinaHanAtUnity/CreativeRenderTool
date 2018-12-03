
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { TemplateValueMap, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
describe('BannerAdUnitParameterFactory', () => {

    const createFactory = () => {
        const platform: Platform = Platform.TEST;
        const nativeBridge: NativeBridge = sinon.createStubInstance(NativeBridge);
        const core: ICoreApi = TestFixtures.getCoreApi(nativeBridge);
        const requestManager: RequestManager = sinon.createStubInstance(RequestManager);
        const clientInfo: ClientInfo = sinon.createStubInstance(ClientInfo);
        const webPlayerContainer: WebPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        (<sinon.SinonStub>clientInfo.getSdkVersion).returns(3000);
        return new BannerAdUnitParametersFactory(platform, core, clientInfo, webPlayerContainer, {
            create: (templateValues: TemplateValueMap) => {
                return new ThirdPartyEventManager(core, requestManager, templateValues);
            }
        });
    };
    it('should create thirdPartyManager with the correct template values', () => {
        const factory = createFactory();
        const placement: Placement = sinon.createStubInstance(Placement);
        (<sinon.SinonStub>placement.getId).returns('1');
        const campaign: BannerCampaign = sinon.createStubInstance(BannerCampaign);
        return factory.create(campaign, placement, {}).then((params) => {
            assert.deepEqual((<any>params.thirdPartyEventManager)._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': '3000'
            });
        });
    });
});
