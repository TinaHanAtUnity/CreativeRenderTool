import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import ValidAdMobCampaign from 'json/campaigns/admob/ValidAdMobCampaign.json';

import 'mocha';
import * as sinon from 'sinon';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ProgrammaticAdMobParser', () => {
        const placementId = 'TestPlacement';
        const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
        const correlationId = '583dfda0d933a3630a53249c';

        let parser: ProgrammaticAdMobParser;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICore;
        let request: RequestManager;
        let session: Session;

        describe('parsing a campaign', () => {
            let campaign: AdMobCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <AdMobCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreModule(nativeBridge);
                (<any>core.Api).Sdk = sinon.createStubInstance(SdkApi);
                core.Config = sinon.createStubInstance(CoreConfiguration);
                core.Ads = TestFixtures.getAdsModule(core);

                request = sinon.createStubInstance(RequestManager);
                core.RequestManager = request;

                session = TestFixtures.getSession();

                parser = new ProgrammaticAdMobParser(core);
            });

            describe('with a proper JSON payload', () => {

                const validateCampaign = () => {
                    const json = ValidAdMobCampaign;
                    assert.isNotNull(campaign);
                    assert.equal(campaign.getDynamicMarkup(), json.content, 'Markup is not equal');
                    assert.equal(campaign.getSession(), session, 'Session is not equal');
                    assert.deepEqual(campaign.getTrackingUrls(), json.trackingUrls, 'Tracking URLs are not equal');
                };

                describe(`on ${Platform[platform]}`, () => {
                    beforeEach(() => {
                        sinon.stub(nativeBridge, 'getPlatform').returns(platform);
                        return parse(ValidAdMobCampaign);
                    });

                    it('should have a video cached from the AdMob ad', () => {
                        const assets = campaign.getRequiredAssets();
                        assert.lengthOf(assets, 0, 'Campaign should not have required assets');
                    });

                    it('should have a video cached from the AdMob ad', () => {
                        const assets = campaign.getOptionalAssets();
                        assert.lengthOf(assets, 0, 'Campaign should not have optional assets');
                    });

                    it('should have valid data', validateCampaign);

                });

            });
        });
    });
});
