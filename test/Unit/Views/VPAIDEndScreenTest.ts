import 'mocha';
import * as sinon from 'sinon';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';

describe('VPAIDEndScreen', () => {
    const sandbox = sinon.createSandbox();
    const nativeBridge = sinon.createStubInstance(NativeBridge);
    const vpaidCampaign = sinon.createStubInstance(VPAIDCampaign);

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('bug fix: removeChild for non-existing element throws and results to a black screen', () => {
        it('should not try to remove end screen which is not attached to DOM', () => {
            const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, '');
            endScreen.render();

            const removeChildSpy = sandbox.spy(document.body, 'removeChild');

            try {
                sandbox.stub(document.body, 'appendChild').throws();
                endScreen.show();
            } catch {
                // empty
            }

            endScreen.remove();
            sandbox.assert.notCalled(removeChildSpy);
        });
    });
});
