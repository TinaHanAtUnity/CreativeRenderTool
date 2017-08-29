import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { DisplayInterstitial } from "Views/DisplayInterstitial";
import { NativeBridge } from "Native/NativeBridge";
import { Placement } from "Models/Placement";
import { DisplayInterstitialCampaign } from "Models/DisplayInterstitialCampaign";

import DummyDisplayInterstitialCampaign from 'json/DummyDisplayInterstitialCampaign.json';
import { Platform } from "Constants/Platform";
const json = JSON.parse(DummyDisplayInterstitialCampaign);

describe('DisplayInterstitial', () => {
    let view: DisplayInterstitial;
    let nativeBridge: NativeBridge;
    let mockNativeBridge: sinon.SinonMock;
    let placement: Placement;
    let campaign: DisplayInterstitialCampaign;
    let container: HTMLElement;

    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);

        nativeBridge = <NativeBridge><any>{
            getPlatform: () => null,
            getApiLevel: () => null
        };
        mockNativeBridge = sinon.mock(nativeBridge);
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

        mockNativeBridge.expects('getPlatform').atLeast(0).returns(Platform.ANDROID);
        mockNativeBridge.expects('getApiLevel').atLeast(0).returns(16);
    });

    afterEach(() => {
        document.body.removeChild(container);
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
});
