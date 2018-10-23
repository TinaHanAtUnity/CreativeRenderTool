import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Overlay } from 'Ads/Views/Overlay';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { Privacy } from 'Ads/Views/Privacy';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';
import { IAdsApi } from 'Ads/IAds';

describe('OverlayTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let privacy: AbstractPrivacy;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);
        privacy = new Privacy(platform, TestFixtures.getCampaign(), sinon.createStubInstance(GdprManager), false, false);
    });

    it('should render', () => {
        const overlay = new Overlay(platform, ads, TestFixtures.getAndroidDeviceInfo(core), true, 'en', 'testGameId', privacy, false);
        overlay.render();
        assert.isNotNull(overlay.container().innerHTML);
        assert.isNotNull(overlay.container().querySelector('.skip-icon'));
        assert.isNotNull(overlay.container().querySelector('.buffering-spinner'));
        assert.isNotNull(overlay.container().querySelector('.mute-button'));
        assert.isNotNull(overlay.container().querySelector('.debug-message-text'));
        assert.isNotNull(overlay.container().querySelector('.call-button'));
        assert.isNotNull(overlay.container().querySelector('.progress'));
        assert.isNotNull(overlay.container().querySelector('.circle-left'));
        assert.isNotNull(overlay.container().querySelector('.circle-right'));
        assert.isNotNull(overlay.container().querySelector('.progress-wrapper'));
    });
});
