import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from 'Views/DisplayInterstitial';
import { NativeBridge } from 'Native/NativeBridge';
import { Placement } from 'Models/Placement';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';

import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import { Platform } from 'Constants/Platform';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitial View', () => {
    const isDisplayInterstitialUrlCampaign = true;
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let sandbox: sinon.SinonSandbox;

    describe('on Display Interstitial Markup Campaign',() => {
        viewUnitTests(!isDisplayInterstitialUrlCampaign);
    });

    describe('on Display Interstitial MarkupUrl Campaign', () => {
        viewUnitTests(isDisplayInterstitialUrlCampaign);

        it('should throw error when no clickthroughurl is in the markupurl', () => {
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
            campaign = TestFixtures.getBadMarkupUrlAd();
            view = new DisplayInterstitial(nativeBridge, placement, campaign);

            sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
            sandbox.stub(nativeBridge, 'getApiLevel').returns(16);

            return new Promise((resolve, reject) => {
                return view.render().then(reject).catch(resolve);
            });
        });

    });

    function viewUnitTests(isUrlCampaign: boolean) {
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
            campaign = TestFixtures.getDisplayInterstitialCampaign(isUrlCampaign);
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
    }
});
