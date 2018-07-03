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
import { Privacy } from 'Views/Privacy';
const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitial View', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let sandbox: sinon.SinonSandbox;

    describe('on Display Interstitial Markup Campaign', () => {
        viewUnitTests();
    });

    function viewUnitTests() {
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
            campaign = TestFixtures.getDisplayInterstitialCampaign();
            const configuration = TestFixtures.getConfiguration();

            const privacy = new Privacy(nativeBridge, configuration.isCoppaCompliant());

            view = new DisplayInterstitial(nativeBridge, placement, campaign, privacy, false);

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
