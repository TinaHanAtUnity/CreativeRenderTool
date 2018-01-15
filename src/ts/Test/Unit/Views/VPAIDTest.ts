import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import VPAIDTestXML from 'xml/VPAIDWithAdParameters.xml';
import VPAIDCampaignJson from 'json/OnProgrammaticVPAIDCampaign.json';
import { VPAID } from 'Views/VPAID';
import { NativeBridge } from 'Native/NativeBridge';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { VPAIDParser } from 'Utilities/VPAIDParser';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';

describe.skip('VPAID View', () => {
    let nativeBridge: NativeBridge;
    let campaign: VPAIDCampaign;
    let vpaid: VPAID;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);

        const vpaidModel = new VPAIDParser().parse(VPAIDTestXML);
        const vpaidCampaignJson = JSON.parse(VPAIDCampaignJson);
        campaign = TestFixtures.getVPAIDCampaign();
        // campaign = new VPAIDCampaign(vpaidModel, TestFixtures.getSession(), vpaidCampaignJson.campaignId, vpaidCampaignJson.gamerId, vpaidCampaignJson.abGroup);

        vpaid = new VPAID(nativeBridge, campaign, TestFixtures.getPlacement(), 'en_US', '11111');
    });

    describe('rendering', () => {

        beforeEach(() => {
            vpaid.render();
        });

        it('should replace the VPAID src url with the placeholder', () => {
            const iframe = vpaid.container().querySelector('iframe')!;
            const srcdoc = iframe.getAttribute('srcdoc')!;
            assert.isTrue(srcdoc.indexOf(campaign.getVPAID().getScriptUrl()) !== -1);
        });
    });

    describe('when iframe is ready', () => {

        let iframe: HTMLIFrameElement;

        beforeEach(() => {
            vpaid.render();
            vpaid.show();
            iframe = <HTMLIFrameElement>vpaid.container().querySelector('iframe');
            document.body.appendChild(vpaid.container());
        });

        afterEach(() => {
            document.body.removeChild(vpaid.container());
            vpaid.hide();
        });

        it('should send the init message', () => {
            const promise = new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (e: MessageEvent) => {
                    try {
                        assert.isTrue(e.data.type === 'init');
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            });
            window.postMessage({ type: 'ready' }, '*');
            return promise;
        });
    });

    describe('showing the ad', () => {
        let iframe: HTMLIFrameElement;

        beforeEach(() => {
            vpaid.render();
            vpaid.show();
            iframe = <HTMLIFrameElement>vpaid.container().querySelector('iframe');
            document.body.appendChild(vpaid.container());
        });

        afterEach(() => {
            document.body.removeChild(vpaid.container());
            vpaid.hide();
        });

        it('should send the show message', () => {
            const promise = new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (e: MessageEvent) => {
                    try {
                        assert.isTrue(e.data.type === 'show');
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            });
            vpaid.showAd();
            return promise;
        });
    });

    describe('handling VPAID events', () => {
        let iframe: HTMLIFrameElement;

        beforeEach(() => {
            vpaid.render();
            vpaid.show();
            iframe = <HTMLIFrameElement>vpaid.container().querySelector('iframe');
            document.body.appendChild(vpaid.container());
        });

        afterEach(() => {
            document.body.removeChild(vpaid.container());
            vpaid.hide();
        });
    });
});
