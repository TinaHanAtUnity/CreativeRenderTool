import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { Campaign } from 'Models/Campaign';
import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Session } from 'Models/Session';
import { AdMobCampaign } from 'Models/Campaigns/AdMobCampaign';
import { Platform } from 'Constants/Platform';
import { SdkApi } from 'Native/Api/Sdk';
import { ProgrammaticVPAIDParser } from 'Parsers/ProgrammaticVPAIDParser';

import IAPPromoCampaign from 'json/campaigns/promo/PromoCampaign.json';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { Url } from 'Utilities/Url';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { VastParser } from 'Utilities/VastParser';
import { VPAIDCampaign } from 'Models/VPAID/VPAIDCampaign';
import { DisplayInterstitialCampaign } from 'Models/Campaigns/DisplayInterstitialCampaign';
import { PromoCampaignParser } from 'Parsers/PromoCampaignParser';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

describe('PromoCampaignParser', () => {
    const placements = ['TestPlacement'];
    const gamerId = 'TestGamerId';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const abGroup = 0;

    let parser: PromoCampaignParser;
    let nativeBridge: NativeBridge;
    let request: Request;
    let session: Session;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        (<any>nativeBridge.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();

        parser = new PromoCampaignParser();
    });

    describe('parsing a campaign', () => {
        describe('with valid payload', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session, gamerId, abGroup).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                PurchasingUtilities.productAvailable = sandbox.stub().returns(true);
                PurchasingUtilities.refreshCatalog = sandbox.stub().returns(Promise.resolve());
                return parse(JSON.parse(IAPPromoCampaign));
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PromoCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(IAPPromoCampaign);
                const content = JSON.parse(json.content);

                assert.equal(campaign.getGamerId(), gamerId, 'GamerID is not equal');
                assert.equal(campaign.getAbGroup(), abGroup, 'ABGroup is not equal');
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getIapProductId(), content.iapProductId, 'IAP Product ID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                assert.equal(campaign.getCreativeResource().getUrl(), content.creativeUrl, 'Creative URL is not equal');
            });
        });
    });
});
