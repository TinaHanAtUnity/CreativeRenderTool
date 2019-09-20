import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
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
import { ICore } from 'Core/ICore';

describe('PromoCampaignParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: PromoCampaignParser;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        (<any>core.Api).Sdk = sinon.createStubInstance(SdkApi);

        session = TestFixtures.getSession();
        parser = new PromoCampaignParser(core);
    });

    describe('parsing a campaign', () => {
        describe('with valid payload where the template is fetched from the backend', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                return parse(IAPPromoCampaign.campaign1);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PromoCampaign, 'Campaign was not a PromoCampaign');

                const json = IAPPromoCampaign.campaign1;
                const content = JSON.parse(json.content);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getIapProductId(), content.premiumProduct.productId, 'IAP Product ID is not equal');
                assert.equal(campaign.getLimitedTimeOffer()!.getDuration(), 86400, 'Limited Time Offer duration is not equal');
            });
        });

        describe('with valid payload where backend supplies enough information so webview template can be used', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
                sandbox.stub(PurchasingUtilities, 'refreshCatalog').returns(Promise.resolve());
                return parse(IAPPromoCampaign.campaign2);
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof PromoCampaign, 'Campaign was not a PromoCampaign');
                const json = IAPPromoCampaign.campaign2;
                const content = JSON.parse(json.content);
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getIapProductId(), content.premiumProduct.productId, 'IAP Product ID is not equal');
                assert.equal(campaign.getLimitedTimeOffer()!.getDuration(), 86400, 'Limited Time Offer duration is not equal');
                const portraitAsset = campaign.getPortraitAssets()!;
                assert.equal(portraitAsset.getBackgroundAsset().getImage().getOriginalUrl(), content.portrait.background.url, 'portrait background url does not match');
                assert.equal(portraitAsset.getBackgroundAsset().getSize().getWidth(), content.portrait.background.size.width, 'portrait background width does not match');
                assert.equal(portraitAsset.getBackgroundAsset().getSize().getHeight(), content.portrait.background.size.height, 'portrait background height does not match');
                assert.equal(portraitAsset.getButtonAsset().getImage().getOriginalUrl(), content.portrait.button.url, 'portrait background url does not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getColor(), content.portrait.button.font.color, 'portrait button font color do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getSize(), content.portrait.button.font.size, 'portrait button font size do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getFamily(), content.portrait.button.font.family, 'portrait button font family do not match');
                assert.equal(portraitAsset.getButtonAsset().getFont()!.getOriginalUrl(), content.portrait.button.font.url, 'portrait button font url do not match');
                assert.equal(portraitAsset.getButtonAsset().getCoordinates()!.getTop(), content.portrait.button.coordinates.top, 'portrait button coordinate top does not match');
                assert.equal(portraitAsset.getButtonAsset().getCoordinates()!.getLeft(), content.portrait.button.coordinates.left, 'portrait button coordinate left does not match');
                assert.equal(portraitAsset.getButtonAsset().getSize().getWidth(), content.portrait.button.size.width, 'portrait button size width does not match');
                assert.equal(portraitAsset.getButtonAsset().getSize().getHeight(), content.portrait.button.size.height, 'portrait button size height does not match');
                const landscapeAsset = campaign.getLandscapeAssets()!;
                assert.equal(landscapeAsset.getBackgroundAsset().getImage().getOriginalUrl(), content.landscape.background.url, 'landscape background url does not match');
                assert.equal(landscapeAsset.getBackgroundAsset().getSize().getWidth(), content.landscape.background.size.width, 'landscape background width does not match');
                assert.equal(landscapeAsset.getBackgroundAsset().getSize().getHeight(), content.landscape.background.size.height, 'landscape background height does not match');
                assert.equal(landscapeAsset.getButtonAsset().getImage().getOriginalUrl(), content.landscape.button.url, 'landscape background url does not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getColor(), content.landscape.button.font.color, 'landscape button font color do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getSize(), content.landscape.button.font.size, 'landscape button font size do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getFamily(), content.landscape.button.font.family, 'landscape button font family do not match');
                assert.equal(landscapeAsset.getButtonAsset().getFont()!.getOriginalUrl(), content.landscape.button.font.url, 'landscape button font url do not match');
                assert.equal(landscapeAsset.getButtonAsset().getCoordinates()!.getTop(), content.landscape.button.coordinates.top, 'landscape button coordinate top does not match');
                assert.equal(landscapeAsset.getButtonAsset().getCoordinates()!.getLeft(), content.landscape.button.coordinates.left, 'landscape button coordinate left does not match');
                assert.equal(landscapeAsset.getButtonAsset().getSize().getWidth(), content.landscape.button.size.width, 'landscape button size width does not match');
                assert.equal(landscapeAsset.getButtonAsset().getSize().getHeight(), content.landscape.button.size.height, 'landscape button size height does not match');
            });
        });

        describe('should add product type to tracking url events', () => {
            let campaign: PromoCampaign;
            let sandbox: sinon.SinonSandbox;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <PromoCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                sandbox = sinon.createSandbox();
                sandbox.stub(PurchasingUtilities, 'getProductType').returns('nonConsumable');
                return parse(IAPPromoCampaign.campaign1);
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
    });
});
