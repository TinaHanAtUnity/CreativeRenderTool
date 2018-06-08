import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';
import { AbstractPrivacy } from 'Views/AbstractPrivacy';
import { Privacy } from 'Views/Privacy';

describe('Overlay', () => {
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
        privacy = new Privacy(nativeBridge, true);
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
