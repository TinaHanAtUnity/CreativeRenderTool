import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { TestFixtures } from '../TestHelpers/TestFixtures';
import { VastEndScreen } from 'Views/VastEndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { VastCampaign } from 'Models/Vast/VastCampaign';

import VastEndScreenFixture from 'html/fixtures/VastEndScreenFixture.html';
import VastCompanionXml from 'xml/VastCompanionAd.xml';

describe('VastEndScreen', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });
    });

    it('should render', () => {
        const vastParser = TestFixtures.getVastParser();
        const vast = vastParser.parseVast(VastCompanionXml);
        const vastCampaign = new VastCampaign(vast, '12345', TestFixtures.getSession(), 'gamerId', 1);
        const endScreen = new VastEndScreen(nativeBridge, false, vastCampaign, 'testGameId');
        endScreen.render();
        assert.equal(endScreen.container().innerHTML, VastEndScreenFixture);
    });
});
