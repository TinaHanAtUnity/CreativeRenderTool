import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';
import { Placement } from 'Models/Placement';
import { MRAID } from 'Views/MRAID';

describe('MRAID', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let placement: Placement;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            muteVideo: false
        });
    });

    it('should render', (done) => {
        const campaign = new MRAIDCampaign({id: '123abc'}, '123456', 1, undefined, `<script src="mraid.js"></script><div>Hello</div>`);
        const mraid = new MRAID(nativeBridge, placement, campaign, 'en');

        mraid.render();

        setTimeout(() => {
            const container = mraid.container();
            assert.isNotNull(container.innerHTML);
            assert.isNotNull(container.querySelector('.close-region'));
            assert.isNotNull(container.querySelector('.close'));
            assert.isNotNull(container.querySelector('.icon-close'));
            assert.isNotNull(container.querySelector('.progress-wrapper'));
            assert.isNotNull(container.querySelector('.circle-left'));
            assert.isNotNull(container.querySelector('.circle-right'));
            assert.isNotNull(container.querySelector('#mraid-iframe'));
            assert.equal(mraid.container().innerHTML.indexOf('mraid.js'), -1);

            done();
        }, 0);
    });

    it('should replace placeholder with dynamic markup injected', () => {
        const campaign = new MRAIDCampaign({id: '123abc', dynamicMarkup: 'InjectMe'}, '123456', 1, undefined, `<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><div>Hello</div>`);
        const mraid = new MRAID(nativeBridge, placement, campaign, 'en');
        return mraid.createMRAID().then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
        });
    });
});
