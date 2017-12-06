import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign, IDisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { DisplayInterstitialMarkupUrlCampaign } from 'Models/Campaigns/DisplayInterstitialMarkupUrlCampaign';
const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitial View', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign<IDisplayInterstitialCampaign>;
    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
        nativeBridge = TestFixtures.getNativeBridge();
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
        campaign = new DisplayInterstitialMarkupUrlCampaign(json.display.markup, TestFixtures.getSession(), json.gamerId, json.abGroup, undefined);
        view = new DisplayInterstitial(nativeBridge, placement, campaign);

        sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
        sandbox.stub(nativeBridge, 'getApiLevel').returns(16);
    });

    afterEach(() => {
        sandbox.restore();
    });

    // Disabled because of missing srcdoc support on Android < 4.4
    xit('should render', () => {
        view.render();
        const srcdoc = view.container().querySelector('#display-iframe')!.getAttribute('srcdoc');

        assert.isNotNull(srcdoc);
        assert.isTrue(srcdoc!.indexOf(json.display.markup) !== -1);
    });

    it('should show', () => {
        view.render();
        view.show();
        view.hide();
    });

    // write unit tests to cover DisplayInterstitialMarkupUrlCampaign - programmatic/static-interstitial-url
    // 'should throw no clickthrough url was found error when the mark nor json do not contain a clickthrough url'
});
