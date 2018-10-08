import { Placement } from 'Ads/Models/Placement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { DisplayInterstitial } from 'Display/Views/DisplayInterstitial';

import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { DefaultPrivacy } from 'Ads/Views/DefaultPrivacy';

const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitialTest', () => {
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
            const gdprManager = sinon.createStubInstance(GdprManager);
            const coreConfig = TestFixtures.getCoreConfiguration();
            const privacy = new DefaultPrivacy(nativeBridge, campaign, gdprManager, false, coreConfig.isCoppaCompliant());

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
