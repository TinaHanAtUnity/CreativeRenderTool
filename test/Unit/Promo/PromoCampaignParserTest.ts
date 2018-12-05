import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';

import IAPPromoCampaign from 'json/campaigns/promo/PromoCampaign.json';
import 'mocha';
import { PromoCampaign } from 'Promo/Models/PromoCampaign';
import { PromoCampaignParser } from 'Promo/Parsers/PromoCampaignParser';
import { PurchasingUtilities } from 'Promo/Utilities/PurchasingUtilities';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('PromoCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: PromoCampaignParser;
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

        request = sinon.createStubInstance(RequestManager);
        session = TestFixtures.getSession();

        parser = new PromoCampaignParser();
    });

    describe('parsing a campaign', () => {
        describe('with valid payload where the template is fetched from the backend', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
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
                assert.equal(campaign.getIapProductId(), content.premiumProduct.productId, 'IAP Product ID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                assert.equal(campaign.getCreativeResource()!.getUrl(), content.creativeUrl, 'Creative URL is not equal');
                assert.equal(campaign.getLimitedTimeOffer()!.getDuration(), 86400, 'Limited Time Offer duration is not equal');
                assert.equal(campaign.isUsingServerTemplate(), true, 'Should not be using webview template');
            });
        });

        describe('with valid payload where backend supplies enough information so webview template can be used', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
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

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PromoCampaign, 'Campaign was not a PromoCampaign');
                const json = JSON.parse(IAPPromoCampaign).campaign2;
                const content = JSON.parse(json.content);
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getIapProductId(), content.premiumProduct.productId, 'IAP Product ID is not equal');
                assert.equal(campaign.getDynamicMarkup(), content.dynamicMarkup, 'Dynamic Markup is not equal');
                assert.equal(campaign.getCreativeResource()!.getUrl(), content.creativeUrl, 'Creative URL is not equal');
                assert.equal(campaign.getLimitedTimeOffer()!.getDuration(), 86400, 'Limited Time Offer duration is not equal');
                assert.equal(campaign.isUsingServerTemplate(), false, 'Should be using server');
                const portraitAsset = campaign.getPortraitAssets()!;
                assert.equal(portraitAsset.getBackgroundAsset().getImage().getOriginalUrl(), content.portrait.background.url, 'portrait background url does not match');
                assert.equal(portraitAsset.getButtonAsset().getImage().getOriginalUrl(), content.portrait.button.url, 'portrait background url does not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getColor(), content.portrait.button.font.color, 'portrait button font color do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getSize(), content.portrait.button.font.size, 'portrait button font size do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getFamily(), content.portrait.button.font.family, 'portrait button font family do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getOriginalUrl(), content.portrait.button.font.url, 'portrait button font url do not match');
                const landscapeAsset = campaign.getLandscapeAssets()!;
                assert.equal(landscapeAsset.getBackgroundAsset().getImage().getOriginalUrl(), content.landscape.background.url, 'landscape background url does not match');
                assert.equal(landscapeAsset.getButtonAsset().getImage().getOriginalUrl(), content.landscape.button.url, 'landscape background url does not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getColor(), content.landscape.button.font.color, 'landscape button font color do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getSize(), content.landscape.button.font.size, 'landscape button font size do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getFamily(), content.landscape.button.font.family, 'landscape button font family do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getOriginalUrl(), content.landscape.button.font.url, 'landscape button font url do not match');
            });
        });

        describe('should add product type to tracking url events', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'getProductType').returns('nonConsumable');
                return parse(JSON.parse(IAPPromoCampaign).campaign1);
            });

            afterEach(() => {
                sandbox.restore();
            });
            it('should update tracking event urls for product type correctly', () => {
                const expected: { [url: string]: string[]} = {
                    'click': ['https://events.iap.unity3d.com/events/v1/click?fakeEvent=true&val=1.99&productType=nonConsumable', 'https://tracking.adsx.unityads.unity3d.com/operative?fakeEvent=true&val=1.99'],
                    'complete': ['https://events.iap.unity3d.com/events/v1/complete?fakeEvent=true&val=1.99&productType=nonConsumable', 'https://tracking.adsx.unityads.unity3d.com/complete?fakeEvent=true&val=1.99'],
                    'impression': ['https://events.iap.unity3d.com/events/v1/impression?fakeEvent=true&val=1.99&productType=nonConsumable', 'https://tracking.adsx.unityads.unity3d.com/impression?fakeEvent=truem&val=1.99'],
                    'purchase': ['https://events.iap.unity3d.com/events/v1/purchase?fakeEvent=true&val=1.99&productType=nonConsumable', 'https://tracking.adsx.unityads.unity3d.com/operative?fakeEvent=true&val=1.99']
                 };
                const actual = campaign.getTrackingEventUrls();
                assert.deepEqual(actual, expected);
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

            context('should resolve campaign', () => {
                it('with invalid catalog by refreshing catalog', () => {

                    sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                    sandbox.stub(PurchasingUtilities, 'isCatalogValid').returns(false);

                    const parse = (data: any) => {
                        const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                        const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                        return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
                            campaign = <PromoCampaign>parsedCampaign;
                            sinon.assert.called(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
                        });
                    };

                    return parse(JSON.parse(IAPPromoCampaign).campaign1);
                });

                it('with valid catalog by not refreshing catalog', () => {

                    sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                    sandbox.stub(PurchasingUtilities, 'isCatalogValid').returns(true);

                    const parse = (data: any) => {
                        const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                        const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                        return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
                            campaign = <PromoCampaign>parsedCampaign;
                            sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
                        });
                    };

                    return parse(JSON.parse(IAPPromoCampaign).campaign1);
                });
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
                    const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                    const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                    return parser.parse(platform, core, request, response, session).then((parsedCampaign) => {
                        campaign = <PromoCampaign>parsedCampaign;
                        sinon.assert.notCalled(<sinon.SinonSpy>PurchasingUtilities.refreshCatalog);
                    });
                };

                return parse(JSON.parse(IAPPromoCampaign).campaign1);
            });
        });
    });
});
