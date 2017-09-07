import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from "Views/DisplayInterstitial";
import { NativeBridge } from "Native/NativeBridge";
import { Placement } from "Models/Placement";
import { DisplayInterstitialCampaign } from "Models/DisplayInterstitialCampaign";

import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import { Platform } from "Constants/Platform";
import { TestFixtures } from "Test/Unit/TestHelpers/TestFixtures";
const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitial', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
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
        campaign = new DisplayInterstitialCampaign(json.display.markup, json.gamerId, json.abGroup);
        view = new DisplayInterstitial(nativeBridge, placement, campaign);

        sandbox.stub(nativeBridge, 'getPlatform').returns(Platform.ANDROID);
        sandbox.stub(nativeBridge, 'getApiLevel').returns(16);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should render', () => {
        view.render();
        const srcdoc = view.container().querySelector('iframe')!.getAttribute('srcdoc');

        assert.isNotNull(srcdoc);
        assert.isTrue(srcdoc!.indexOf(json.display.markup) !== -1);
    });

    it('should show', () => {
        view.render();
        view.show();
    });

    it('should redirect when the redirect message is sent', () => {

        const spy = sinon.spy();
        view.onClick.subscribe(spy);

        view.render();
        view.show();

        window.postMessage({ type: 'redirect', href: 'http://unity3d.com' }, '*');

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    assert.isTrue(spy.calledWith('http://unity3d.com'));
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, 100);
        });
    });

    it('should redirect when the click catcher is clicked', () => {
        campaign.set('clickThroughUrl', 'http://unity3d.com');

        const spy = sinon.spy();
        view.onClick.subscribe(spy);

        view.render();
        view.show();

        (<HTMLElement>view.container().querySelector('.iframe-click-catcher')!).click();

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    assert.isTrue(spy.calledWith('http://unity3d.com'));
                    resolve();
                } catch (e) {
                    reject(e);
                }
            }, 100);
        });
    });
});
