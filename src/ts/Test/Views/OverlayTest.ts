import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Overlay } from 'Views/Overlay';

describe('Overlay', () => {
    let handleInvocation: Sinon.SinonSpy;
    let handleCallback: Sinon.SinonSpy;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
    });

    it('should render with translations', () => {
        let overlay = new Overlay(nativeBridge, true, 'fi');
        overlay.render();
        let skipButtonElement = overlay.container().querySelectorAll('.skip-button')[0];
        assert.equal(skipButtonElement.innerHTML, 'Voit ohittaa videon <span class="skip-duration">0</span> sekunnin päästä');
    });
});
