import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { RequestManager } from 'Core/Managers/RequestManager';

import ProgrammaticVPAIDCampaign from 'json/campaigns/vpaid/ProgrammaticVPAIDCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastParser } from 'VAST/Utilities/VastParser';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { Platform } from 'Core/Constants/Platform';
import { Backend } from 'Backend/Backend';
import { ICoreApi } from 'Core/ICore';

describe('ProgrammaticVPAIDParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: ProgrammaticVPAIDParser;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        (<any>core.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new ProgrammaticVPAIDParser();
    });

    describe('parsing a campaign', () => {
        describe('with proper XML payload', () => {
            let campaign: VPAIDCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
                    campaign = <VPAIDCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticVPAIDCampaign));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VPAIDCampaign, 'Campaign was not an VPAIDCampaign');

                const json = JSON.parse(ProgrammaticVPAIDCampaign);
                const vast = new VastParser().parseVast(decodeURIComponent(json.content));

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getVPAID().getScriptUrl(), 'https://fake-ads-backend.applifier.info/get_file/js/vpaid_sample.js', 'Script URL is not equal');
            });
        });
    });
});
