import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IVastEndscreenParameters, VastEndScreen } from 'VAST/Views/VastEndScreen';

describe('VastEndScreen', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let vastEndscreenParameters: IVastEndscreenParameters;
    let privacyManager: UserPrivacyManager;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

        vastEndscreenParameters = {
            clientInfo: sinon.createStubInstance(ClientInfo),
            campaign: TestFixtures.getCompanionVastCampaign(),
            seatId: 0
        };

        privacyManager = sinon.createStubInstance(UserPrivacyManager);
    });

    it('should render', () => {
        const privacy = new Privacy(platform, vastEndscreenParameters.campaign, privacyManager, false, false);
        const endScreen = new VastEndScreen(platform, vastEndscreenParameters, privacy);
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
