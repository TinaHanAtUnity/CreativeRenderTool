import 'mocha';

import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Placement } from 'Models/Placement';
import { MRAID } from 'Views/MRAID';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Configuration } from 'Models/Configuration';

describe('MRAID', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let configuration: Configuration;

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

        configuration = TestFixtures.getConfiguration();
    });

    it('should render', (done) => {
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new MRAID(nativeBridge, placement, campaign, configuration.isCoppaCompliant());

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
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new MRAID(nativeBridge, placement, campaign, configuration.isCoppaCompliant());
        return mraid.createMRAID().then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
        });
    });

    it('should remove the mraid.js placeholder when it has a query parameter', () => {
        const markup = '<script src="mraid.js?foo=bar&baz=blah><div>Hello, world!</div>';
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        // const campaign = new MRAIDCampaign({id: '123abc', dynamicMarkup: 'InjectMe'}, TestFixtures.getSession(), '123456', 1, undefined, undefined, markup);
        const mraid = new MRAID(nativeBridge, placement, campaign, configuration.isCoppaCompliant());
        return mraid.createMRAID().then((src) => {
            const dom = new DOMParser().parseFromString(src, 'text/html');
            assert.isNotNull(dom);
            assert.isNull(dom.querySelector('script[src^="mraid.js"]'));
        });
    });

    it('should not remove string replacement patterns', () => {
        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        // const campaign = new MRAIDCampaign({id: '123abc', dynamicMarkup: 'InjectMe'}, TestFixtures.getSession(), '123456', 1, undefined, undefined, `<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>var test = "Hello $&"</script><div>Hello World</div>`);
        const mraid = new MRAID(nativeBridge, placement, campaign, configuration.isCoppaCompliant());
        return mraid.createMRAID().then((mraidSrc) => {
            assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
            assert.notEqual(mraidSrc.indexOf('<script>var test = "Hello $&"</script>'), -1);
        });
    });
});
