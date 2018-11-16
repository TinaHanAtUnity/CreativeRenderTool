
import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { BannerAdUnitParametersFactory } from 'Banners/AdUnits/BannerAdUnitParametersFactory';
import { WebPlayerContainer } from 'Ads/Utilities/WebPlayer/WebPlayerContainer';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { BannerCampaign } from 'Banners/Models/BannerCampaign';
import { Placement } from 'Ads/Models/Placement';
import { PlayerMetaData } from 'Core/Models/MetaData/PlayerMetaData';
import { RequestManager } from 'Core/Managers/RequestManager';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
describe('BannerAdUnitParameterFactory', () => {
    const createFactory = (gamerSid: string | undefined) => {
        const platform: Platform = Platform.TEST;
        const nativeBridge: NativeBridge = sinon.createStubInstance(NativeBridge);
        const core: ICoreApi = TestFixtures.getCoreApi(nativeBridge);
        const request: RequestManager = sinon.createStubInstance(RequestManager);
        const clientInfo: ClientInfo = sinon.createStubInstance(ClientInfo);
        const webPlayerContainer: WebPlayerContainer = sinon.createStubInstance(WebPlayerContainer);
        const metadataManager: MetaDataManager = sinon.createStubInstance(MetaDataManager);
        const playerMetaData: PlayerMetaData = sinon.createStubInstance(PlayerMetaData);
        if (gamerSid) {
            (<sinon.SinonStub>playerMetaData.getServerId).returns(gamerSid);
            (<sinon.SinonStub>metadataManager.fetch).resolves(playerMetaData);
        } else {
            (<sinon.SinonStub>metadataManager.fetch).resolves(undefined);
        }
        (<sinon.SinonStub>clientInfo.getSdkVersion).returns(3000);
        return new BannerAdUnitParametersFactory(platform, core, request, clientInfo, webPlayerContainer, metadataManager);
    };
    it('should create thirdPartyManager with the correct template values', () => {
        const factory = createFactory('test-gamerSid');
        const placement: Placement = sinon.createStubInstance(Placement);
        (<sinon.SinonStub>placement.getId).returns('1');
        const campaign: BannerCampaign = sinon.createStubInstance(BannerCampaign);
        return factory.create(campaign, placement, {}).then((params) => {
            assert.deepEqual((<any>params.thirdPartyEventManager)._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': '3000',
                '%GAMER_SID%': 'test-gamerSid'
            });
        });
    });
    it('should create thirdPartyManager with undefined gamerSid', () => {
        const factory = createFactory(undefined);
        const placement: Placement = sinon.createStubInstance(Placement);
        (<sinon.SinonStub>placement.getId).returns('1');
        return factory.create(sinon.createStubInstance(BannerCampaign), placement, {}).then((params) => {
            assert.deepEqual((<any>params.thirdPartyEventManager)._templateValues, {
                '%ZONE%': '1',
                '%SDK_VERSION%': '3000',
                '%GAMER_SID%': ''
            });
        });
    });
});
