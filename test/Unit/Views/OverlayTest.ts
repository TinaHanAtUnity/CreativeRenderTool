import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Overlay } from 'Ads/Views/Overlay';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { DefaultPrivacy } from 'Ads/Views/DefaultPrivacy';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('OverlayTest', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let privacy: AbstractPrivacy;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
        privacy = new DefaultPrivacy(nativeBridge, TestFixtures.getCampaign(), sinon.createStubInstance(GdprManager), false, false);
    });

    it('should render', () => {
        const overlay = new Overlay(nativeBridge, true, 'en', 'testGameId', privacy, false);
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
