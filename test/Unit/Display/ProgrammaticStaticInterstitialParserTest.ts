import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';
import { RequestManager } from 'Core/Managers/RequestManager';
import { DisplayInterstitialCampaign } from 'Display/Models/DisplayInterstitialCampaign';
import { ProgrammaticStaticInterstitialParser } from 'Display/Parsers/ProgrammaticStaticInterstitialParser';

import DisplayStaticInterstitialCampaignHTML from 'json/campaigns/display/DisplayStaticInterstitialCampaignHTML.json';
import DisplayStaticInterstitialCampaignJS from 'json/campaigns/display/DisplayStaticInterstitialCampaignJS.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { Backend } from 'Backend/Backend';

describe('ProgrammaticVPAIDParser', () => {
    const placements = ['TestPlacement'];
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';

    let parser: ProgrammaticStaticInterstitialParser;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        const platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);

        (<any>core.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(Request);
        session = TestFixtures.getSession();
    });

    describe('parsing an HTML campaign', () => {

        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(false);
        });

        describe('with proper HTML payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(Platform.ANDROID, core, request, response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignHTML));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignHTML);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), decodeURIComponent(json.content), 'Dynamic Markup is not equal');
            });
        });
    });

    describe('parsing a JS campaign', () => {
        beforeEach(() => {
            parser = new ProgrammaticStaticInterstitialParser(true);
        });

        describe('with proper JS payload', () => {
            let campaign: DisplayInterstitialCampaign;
            const parse = (data: any) => {
                const response = new AuctionResponse(placements, data, mediaId, correlationId);
                return parser.parse(Platform.ANDROID, core, request, response, session).then((parsedCampaign) => {
                    campaign = <DisplayInterstitialCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(DisplayStaticInterstitialCampaignJS));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof DisplayInterstitialCampaign, 'Campaign was not an DisplayInterstitialCampaign');

                const json = JSON.parse(DisplayStaticInterstitialCampaignJS);

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getDynamicMarkup(), '<script>' + decodeURIComponent(json.content) + '</script>', 'Dynamic Markup is not equal');
            });
        });
    });
});
