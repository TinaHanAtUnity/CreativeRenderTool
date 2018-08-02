import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { Request } from 'Utilities/Request';
import { AuctionResponse } from 'Models/AuctionResponse';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Session } from 'Models/Session';
import { SdkApi } from 'Native/Api/Sdk';

import IAPPromoCampaign from 'json/campaigns/promo/PromoCampaign.json';
import { PromoCampaignParser } from 'Parsers/PromoCampaignParser';
import { PromoCampaign } from 'Models/Campaigns/PromoCampaign';
import { PurchasingUtilities } from 'Utilities/PurchasingUtilities';

describe('PromoCampaignParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

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
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                return parse(JSON.parse(IAPPromoCampaign).campaign1);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PromoCampaign, 'Campaign was not a PromoCampaign');

                const json = JSON.parse(IAPPromoCampaign).campaign1;
                const content = JSON.parse(json.content);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getIapProductId(), content.iapProductId, 'IAP Product ID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                assert.equal(campaign.getRewardedPromo(), content.rewardedPromo, 'Allow Skip is not equal');
                assert.equal(campaign.getCreativeResource().getUrl(), content.creativeUrl, 'Creative URL is not equal');
            });
        });

        describe('With content that includes rewardedPromo as false', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                return parse(JSON.parse(IAPPromoCampaign).campaign2);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should set rewardedPromo to false in the campaign', () => {
                const json = JSON.parse(IAPPromoCampaign).campaign2;
                const content = JSON.parse(json.content);
                assert.equal(content.rewardedPromo, false);
                assert.equal(campaign.getRewardedPromo(), content.rewardedPromo);
            });
        });

        describe('With content that includes no rewardedPromo', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                return parse(JSON.parse(IAPPromoCampaign).campaign3);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should set rewardedPromo to false in the campaign', () => {
                const json = JSON.parse(IAPPromoCampaign).campaign3;
                const content = JSON.parse(json.content);
                assert.equal(content.rewardedPromo, undefined);
                assert.equal(campaign.getRewardedPromo(), false);
            });
        });

        describe('if Purchasing is initialized', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(true);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should refresh catalog and resolve campaign', () => {

                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());

                const parse = (data: any) => {
                    const response = new AuctionResponse(placements, data, mediaId, correlationId);
                    return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                        campaign = <PromoCampaign>parsedCampaign;
                        sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
                    });
                };

                return parse(JSON.parse(IAPPromoCampaign).campaign1);
            });
        });

        describe('if Purchasing is not initialized', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isInitialized').returns(false);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should resolve campaign and not refresh catalog', () => {
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                const parse = (data: any) => {
                    const response = new AuctionResponse(placements, data, mediaId, correlationId);
                    return parser.parse(nativeBridge, request, response, session).then((parsedCampaign) => {
                        campaign = <PromoCampaign>parsedCampaign;
                        sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
                    });
                };

                return parse(JSON.parse(IAPPromoCampaign).campaign1);
            });
        });
    });
});
